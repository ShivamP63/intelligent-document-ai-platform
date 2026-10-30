from pathlib import Path
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.db import get_db
from app.models import Document, DocumentPage
from app.schemas import DocumentOut, DocumentPageOut
from app.processing.pdf import extract_pages

router = APIRouter(prefix="/documents", tags=["documents"])
MAX_FILE_BYTES = 10 * 1024 * 1024
UPLOADS_DIR = Path(__file__).resolve().parents[3] / "storage" / "uploads"

def get_storage_dir() -> Path:
    return UPLOADS_DIR

@router.post("", response_model=DocumentOut, status_code=201)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    storage_dir: Path = Depends(get_storage_dir),
):
    filename = Path((file.filename or "").replace("\\", "/")).name
    if not filename or len(filename) > 255 or not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Only .pdf files are supported")
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=415, detail="Expected PDF content type")
    data = file.file.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="PDF exceeds 10 MB limit")
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status_code=422, detail="Invalid PDF signature")
    pages = extract_pages(data)

    stored_filename = f"{uuid4().hex}.pdf"
    storage_dir.mkdir(parents=True, exist_ok=True)
    stored_path = storage_dir / stored_filename
    stored_path.write_bytes(data)
    try:
        document = Document(
            original_filename=filename, stored_filename=stored_filename,
            content_type="application/pdf", size_bytes=len(data),
            page_count=len(pages), status="PROCESSED",
        )
        db.add(document)
        db.flush()
        for index, text in enumerate(pages, start=1):
            db.add(DocumentPage(document_id=document.id, page_number=index, extracted_text=text))
        db.commit()
        db.refresh(document)
        return document
    except SQLAlchemyError:
        db.rollback()
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Failed to save document")

@router.get("", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    return db.scalars(select(Document).order_by(Document.created_at.desc()).limit(50)).all()

@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: UUID, db: Session = Depends(get_db)):
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{document_id}/pages", response_model=list[DocumentPageOut])
def get_pages(document_id: UUID, db: Session = Depends(get_db)):
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return db.scalars(
        select(DocumentPage).where(DocumentPage.document_id == document_id).order_by(DocumentPage.page_number)
    ).all()
