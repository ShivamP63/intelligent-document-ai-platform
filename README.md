# Intelligent Document Processing & AI Search Platform

**Status:** Sprint 1 source implemented; end-to-end PostgreSQL verification pending. ML, semantic search and RAG are future releases.

Stack: Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, pypdf, React and TypeScript.

## Local development

1. Install Python 3.11+, Node.js and Docker Desktop.
2. Start the database from repository root: `docker compose up -d postgres` (local port 5434).
3. Inside `backend/`, create and activate a virtual environment, then `pip install -e '.[dev]'`.
4. Run `alembic upgrade head` to create the tables; run `pytest` for backend tests.
5. Run `uvicorn app.main:app --reload --port 8000` and visit `http://localhost:8000/docs`.
6. In a separate terminal, run `cd frontend && npm install && npm run dev` from repository root; open `http://localhost:5174`.
7. Upload a non-sensitive text PDF. Verify the document appears in the library and extracted page text remains visible after refreshing.

Only text PDFs (maximum 10 MB, 50 pages) are supported; scanned/image-only PDFs are rejected. Do not publicly deploy this unauthenticated API or upload sensitive documents. Docker Compose credentials are for local development only.

See [API design](docs/api-design.md), [roadmap](docs/roadmap.md) and [architecture](docs/architecture.md).
