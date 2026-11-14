# Intelligent Document AI Platform

A Python-first full-stack application for uploading, extracting, storing, and reviewing text-based PDF documents through a React interface and FastAPI backend.

[Live Demo](https://intelligent-document-ai-demo.vercel.app/) · [GitHub repository](https://github.com/ShivamP63/intelligent-document-ai-platform)

## What the project demonstrates

This project shows how I build a complete application across the frontend, backend, database, document-processing, testing, and delivery layers.

- PDF upload and document-library workflows
- Text extraction with pypdf in the API-backed application flow
- React and TypeScript interface for browsing document metadata and extracted content
- FastAPI REST endpoints with interactive OpenAPI documentation
- PostgreSQL persistence using SQLAlchemy models and Alembic migrations
- Docker Compose environment for the UI, API, and database
- Automated browser-to-database validation in GitHub Actions
- Browser-based hosted preview for reviewing the document experience

The hosted demo is designed as a lightweight browser preview. The repository also includes the full Dockerized FastAPI and PostgreSQL workflow for local execution and automated testing.

## Architecture

~~~mermaid
flowchart LR
    UI[React and TypeScript UI] --> API[Python and FastAPI]
    API --> PDF[pypdf extraction]
    API --> DB[(PostgreSQL)]
    CI[GitHub Actions] --> TEST[pytest and Playwright]
~~~

## Technology stack

| Layer | Technologies |
|---|---|
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Data access | SQLAlchemy, Alembic |
| Database | PostgreSQL |
| Document processing | pypdf, browser-side pdf.js preview |
| Frontend | React, TypeScript, HTML, CSS |
| Testing | pytest, Playwright |
| Delivery | Docker Compose, GitHub Actions, Vercel preview |

## Run the full-stack application locally

Install Docker Desktop, then run the application from the repository root:

~~~bash
docker compose up -d --build
~~~

Open the following URLs:

- React application: http://localhost:5174
- FastAPI documentation: http://localhost:8000/docs

Upload a non-sensitive text PDF, review the extracted content, and refresh the application to verify PostgreSQL-backed persistence.

Stop the services with:

~~~bash
docker compose down
~~~

The named database volume remains available unless it is explicitly removed.

## Backend development

From the backend directory:

~~~bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
alembic upgrade head
pytest
uvicorn app.main:app --reload --port 8000
~~~

The API documentation is available at http://localhost:8000/docs.

## Frontend development

From the frontend directory:

~~~bash
npm install
npm run dev
~~~

The development interface is available at http://localhost:5174.

## Continuous integration

The GitHub Actions workflow exercises the browser-to-database path with a generated, non-sensitive PDF. It validates the Dockerized React interface, FastAPI service, PostgreSQL persistence, and document extraction workflow.

The automated checks cover:

- API and validation behavior
- PDF upload and text extraction
- document metadata persistence
- browser interaction through the React interface
- end-to-end database verification

## Repository structure

~~~text
intelligent-document-ai-platform/
├── backend/                    # FastAPI application, models, migrations, and tests
├── frontend/                   # React and TypeScript interface
├── docs/                       # Architecture and API design notes
├── docker-compose.yml          # Local full-stack environment
├── Dockerfile                  # Container build configuration
└── README.md
~~~

## Engineering notes

- The API-backed workflow is intended for local development and testing through Docker Compose.
- Use non-sensitive sample PDFs during demonstrations.
- Scanned or image-only PDFs are outside the text-extraction workflow.
- Environment-specific values belong in local configuration and should not be committed.

## Status

The project has a live browser demo and a verified Dockerized full-stack workflow. The repository is organized to make the Python backend, React frontend, relational data model, document-processing path, and automated validation easy to review.
