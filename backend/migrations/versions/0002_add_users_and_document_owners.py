"""Add users and document ownership."""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.add_column("documents", sa.Column("owner_id", sa.Uuid(), nullable=True))
    op.create_foreign_key("fk_documents_owner_id", "documents", "users", ["owner_id"], ["id"], ondelete="CASCADE")
    op.execute("INSERT INTO users (id, email, password_hash, created_at) VALUES ('00000000-0000-0000-0000-000000000001', 'migration-owner@localhost', 'disabled', CURRENT_TIMESTAMP) ON CONFLICT (email) DO NOTHING")
    op.execute("UPDATE documents SET owner_id = '00000000-0000-0000-0000-000000000001' WHERE owner_id IS NULL")
    op.alter_column("documents", "owner_id", nullable=False)
    op.create_index("ix_documents_owner_id", "documents", ["owner_id"])

def downgrade():
    op.drop_index("ix_documents_owner_id", table_name="documents")
    op.drop_constraint("fk_documents_owner_id", "documents", type_="foreignkey")
    op.drop_column("documents", "owner_id")
    op.drop_table("users")
