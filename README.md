# Intelligent Document Processing & AI Search Platform

**Status: Initial scaffold — PDF processing, ML, semantic search and RAG are not implemented yet.**

React + TypeScript frontend; Python/FastAPI backend; PostgreSQL (Docker Compose). The current skeleton has a static UI and a health endpoint. Document classification, embeddings, retrieval and RAG are planned extensions.

## Local setup

1. Install Python 3.11+, Node.js, and Docker Desktop.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Install backend dependencies: `cd backend && python -m venv .venv`, activate the environment, then `pip install -e '.[dev]'`.
4. Start API: `uvicorn app.main:app --reload --port 8000`.
5. Start UI in another terminal: `cd frontend && npm install && npm run dev` (port 5174).

Use only non-sensitive, legally reusable PDFs; do not publicly expose upload endpoints without security. Builds and persistence have not yet been verified.

See [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [API plan](docs/api-design.md).
