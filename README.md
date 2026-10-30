# Intelligent Document Processing & AI Search Platform

**In development — Sprint 1 source implemented; local end-to-end PostgreSQL verification pending.**

A full-stack application for uploading and organizing documents, extracting text, and—through later milestones—adding evaluated ML classification, semantic search, and source-grounded AI answers.

**Tech stack:** Python · FastAPI · SQLAlchemy · Alembic · PostgreSQL · pypdf · React · TypeScript

## Project overview

The initial workflow is a document library that accepts text-based PDFs, extracts page text, and displays metadata and extracted content through a React application. Sprint 1 source code exists, but the complete browser-to-PostgreSQL workflow has **not yet been verified end to end**.

### Planned development milestones

1. **Sprint 1 — Document library:** Validated text-PDF upload, extraction, document metadata, React library UI, and initial tests; **source implemented, end-to-end verification pending**.
2. **Traditional ML classification:** TF-IDF / scikit-learn baseline, training/evaluation pipeline, and classification API.
3. **Semantic search:** Chunking, embeddings, pgvector, and meaning-based retrieval.
4. **RAG Q&A:** LLM integration with document/page citations and evaluation.
5. **Reliability & deployment:** Background processing, tests, CI/CD, observability, and cloud deployment.

**ML classification, semantic search, and RAG have not been implemented yet.** See [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [API design](docs/api-design.md).

## Local development

1. Install Python 3.11+, Node.js and Docker Desktop.
2. Start PostgreSQL from the repository root: `docker compose up -d postgres` (local port 5434).
3. Inside `backend/`, create and activate a virtual environment, then run `pip install -e '.[dev]'`.
4. Run `alembic upgrade head` to create tables and `pytest` for backend tests.
5. Run `uvicorn app.main:app --reload --port 8000` and visit `http://localhost:8000/docs`.
6. In a separate terminal, from the repository root run `cd frontend && npm install && npm run dev`. Open `http://localhost:5174`.
7. Upload a non-sensitive text PDF. Verify its metadata and extracted text remain visible after refreshing. **This end-to-end check is still pending.**

**Local development only:** The initial upload flow supports text-based PDFs up to 10 MB and 50 pages; scanned/image-only PDFs are rejected. Do not upload sensitive documents or expose the unauthenticated API publicly. Compose credentials are local-development defaults.
