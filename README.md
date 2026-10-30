# Intelligent Document Processing & AI Search Platform

**Status:** Sprint 1 backend code added. **React UI integration, PostgreSQL verification, ML and RAG remain pending.**

Stack: Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, pypdf, React, TypeScript.

## Local development

1. Install Python 3.11+, Node.js and Docker Desktop.
2. Start database from repository root: `docker compose up -d postgres` (local PostgreSQL port 5434).
3. Inside `backend/`, create a virtual environment and run `pip install -e '.[dev]'`.
4. Apply migration: `alembic upgrade head`.
5. Run API: `uvicorn app.main:app --reload --port 8000`; view `http://localhost:8000/docs`.
6. Run backend tests: `pytest` (uses SQLite test DB and generated non-sensitive PDF fixtures).
7. Run placeholder UI in `frontend/`: `npm install && npm run dev` (port 5174); functional UI is next.

Only text PDFs (maximum 10 MB, 50 pages) are supported. Store only non-sensitive test documents. Do not publicly deploy an upload API without authentication, authorization and security hardening. Credentials in local compose are development examples only.

See [API design](docs/api-design.md) and [roadmap](docs/roadmap.md).
