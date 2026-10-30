from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PROCESSED")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    pages: Mapped[list[DocumentPage]] = relationship(
        back_populates="document", cascade="all, delete-orphan", order_by="DocumentPage.page_number"
    )

class DocumentPage(Base):
    __tablename__ = "document_pages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    extracted_text: Mapped[str] = mapped_column(Text, nullable=False)
    document: Mapped[Document] = relationship(back_populates="pages")
