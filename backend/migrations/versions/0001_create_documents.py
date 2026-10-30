"""Initial documents and page text

Revision ID: 0001
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "documents",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("original_filename", sa.String(255), nullable=False),
        sa.Column("stored_filename", sa.String(64), unique=True, nullable=False),
        sa.Column("content_type", sa.String(100), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("page_count", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("size_bytes > 0", name="ck_document_size"),
        sa.CheckConstraint("page_count > 0", name="ck_document_pages"),
    )
    op.create_table(
        "document_pages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("document_id", sa.Uuid(), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=False),
        sa.UniqueConstraint("document_id", "page_number", name="uq_document_page"),
    )
    op.create_index("ix_document_pages_document_id", "document_pages", ["document_id"])

def downgrade():
    op.drop_index("ix_document_pages_document_id", table_name="document_pages")
    op.drop_table("document_pages")
    op.drop_table("documents")
