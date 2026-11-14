# Intelligent Document Processing & AI Search Platform

## Live browser-only preview

**[Intelligent Document public demo](https://intelligent-document-ai-demo.vercel.app)** — hosted on Vercel (deployed 2026-11-13).

The public demo extracts text from text-based PDFs in the visitor's browser with pdf.js and stores extracted text in localStorage. It does not upload PDFs to FastAPI or use a cloud PostgreSQL database. The full-stack Docker Compose application is separately tested through GitHub Actions.

**Important:** GitHub is the source of truth, but this Vercel project was deployed from the checked-in frontend source directly because the Vercel team's GitHub Login Connection has not been enabled. New GitHub commits do **not** automatically update the live Vercel site until that connection is configured or another explicit deployment is made.

**v0.1.0 local-first milestone verified in CI — automated browser-to-PostgreSQL test passed on 2026-11-13.**

A full-stack application for uploading and organizing documents, extracting text, and—through later milestones—adding evaluated ML classification, semantic search, and source-grounded AI answers.

**Tech stack:** Python · FastAPI · SQLAlchemy · Alembic · PostgreSQL · pypdf · React · TypeScript

## Project overview

The initial workflow is a document library that accepts text-based PDFs, extracts page text, and displays metadata and extracted content through a React application. Sprint 1 code has been verified end to end by an automated Docker + Playwright test in GitHub Actions.

### Planned development milestones

1. **Sprint 1 — Document library:** Validated text-PDF upload, extraction, document metadata, React library UI, and initial tests; **implemented and verified by automated browser test in CI**.
2. **Traditional ML classification:** TF-IDF / scikit-learn baseline, training/evaluation pipeline, and classification API.
3. **Semantic search:** Chunking, embeddings, pgvector, and meaning-based retrieval.
4. **RAG Q&A:** LLM integration with document/page citations and evaluation.
5. **Reliability & deployment:** Background processing, tests, CI/CD, observability, and cloud deployment.

**ML classification, semantic search, and RAG have not been implemented yet.** See [roadmap](docs/roadmap.md), [architecture](docs/architecture.md), and [API design](docs/api-design.md).

## One-command Docker demo (local)

With Docker Desktop running, execute at the repository root:

```bash
docker compose up -d --build
```

Open **http://localhost:5174** (React UI) and **http://localhost:8000/docs** (FastAPI API docs). Upload a non-sensitive text PDF, view its extracted pages, and refresh to verify PostgreSQL-backed persistence. Stop with `docker compose down`; Docker volumes retain the database and uploaded files unless explicitly removed.

GitHub Actions includes a Playwright browser test using a generated, non-sensitive PDF to verify upload and extraction across the Dockerized UI, FastAPI backend, and PostgreSQL. **This version is local-only**; the unauthenticated document upload API must not be made public or used for sensitive material.

## Manual local development

1. Install Python 3.11+, Node.js and Docker Desktop.
2. Start PostgreSQL from the repository root: `docker compose up -d postgres` (local port 5434).
3. Inside `backend/`, create and activate a virtual environment, then run `pip install -e '.[dev]'`.
4. Run `alembic upgrade head` to create tables and `pytest` for backend tests.
5. Run `uvicorn app.main:app --reload --port 8000` and visit `http://localhost:8000/docs`.
6. In a separate terminal, from the repository root run `cd frontend && npm install && npm run dev`. Open `http://localhost:5174`.
7. Upload a non-sensitive text PDF. Verify its metadata and extracted text remain visible after refreshing. **This exact workflow passed the automated browser test in CI; manual walkthrough is optional.**

**Local development only:** The initial upload flow supports text-based PDFs up to 10 MB and 50 pages; scanned/image-only PDFs are rejected. Do not upload sensitive documents or expose the unauthenticated API publicly. Compose credentials are local-development defaults.

## Hosted browser-only portfolio preview

The Vercel frontend is intentionally a **browser-only interactive preview**, not a cloud deployment of the FastAPI/PostgreSQL backend. It uses pdf.js to extract selectable PDF text entirely in the visitor's browser and localStorage to remember extracted text in that browser. It never uploads files to a server. Only use non-sensitive sample PDFs; browser storage can be cleared or reach its quota.

The full Python/FastAPI, PostgreSQL, Alembic, pypdf and React application runs through Docker Compose and has passed PDF upload and persistence browser tests in GitHub Actions. The public preview uses `VITE_DEMO_MODE=true`; localhost still calls the real API by default.


<!-- AWS API integration deployment marker -->
