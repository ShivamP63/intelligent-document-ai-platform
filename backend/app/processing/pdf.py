from io import BytesIO
from fastapi import HTTPException
from pypdf import PdfReader
from pypdf.errors import PdfReadError

MAX_PAGES = 50
MAX_TEXT_CHARS = 1_000_000

def extract_pages(content: bytes) -> list[str]:
    try:
        reader = PdfReader(BytesIO(content), strict=False)
        if reader.is_encrypted:
            raise HTTPException(status_code=422, detail="Encrypted PDFs are not supported")
        if len(reader.pages) == 0 or len(reader.pages) > MAX_PAGES:
            raise HTTPException(status_code=422, detail=f"PDF must contain 1-{MAX_PAGES} pages")
        pages = []
        total_chars = 0
        for page in reader.pages:
            text = (page.extract_text() or "").strip()
            total_chars += len(text)
            if total_chars > MAX_TEXT_CHARS:
                raise HTTPException(status_code=413, detail="Extracted text is too large")
            pages.append(text)
        if not any(pages):
            raise HTTPException(status_code=422, detail="No selectable text found; scanned PDFs are not supported yet")
        return pages
    except HTTPException:
        raise
    except (PdfReadError, ValueError, TypeError, KeyError, OSError) as exc:
        raise HTTPException(status_code=422, detail="PDF could not be parsed") from exc
