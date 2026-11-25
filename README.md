# Intelligent Document AI Platform

A Python-first full-stack application for uploading, extracting, storing, and reviewing text-based PDF documents through a React interface and FastAPI backend.

[Live application](https://intelligent-document-ai-demo.vercel.app/) · [GitHub repository](https://github.com/ShivamP63/intelligent-document-ai-platform)

## Current live deployment

The application is deployed as a split frontend and backend system.

- **Frontend:** React and TypeScript hosted on Vercel
- **Backend:** FastAPI running on an AWS-hosted Docker service
- **Database:** PostgreSQL used by the FastAPI service
- **Authentication:** Account registration and login with JWT bearer tokens
- **Document workflow:** Authenticated PDF upload, text extraction, metadata persistence, and page-by-page reading

The frontend uses same-origin requests such as `/api/auth/login` and `/api/documents`. Vercel rewrites those requests to the AWS API. The live health endpoint is available at [`/api/health`](https://intelligent-document-ai-demo.vercel.app/api/health).

The AWS backend deployment workflow builds the backend image, pushes it to a private Amazon ECR repository, and restarts the service on the shared EC2 host through AWS Systems Manager. GitHub Actions authenticates to AWS with OIDC rather than long-lived access keys.

## User workflow

1. Register an account or sign in.
2. Select a text-based PDF up to 10 MB and 50 pages.
3. Upload the document through the authenticated FastAPI endpoint.
4. Extract text from each page with `pypdf`.
5. Store document metadata and extracted pages in PostgreSQL.
6. Open the document library and read extracted content page by page.

Documents are scoped to the authenticated user. A user can only list, open, or read pages for documents they own.

## Architecture

~~~mermaid
flowchart LR
    UI[React and TypeScript on Vercel] --> RW[Vercel API rewrite]
    RW --> API[FastAPI on AWS]
    API --> PDF[pypdf extraction]
    API --> DB[(PostgreSQL)]
    CI[GitHub Actions] --> ECR[Private Amazon ECR]
    ECR --> API
~~~

## Technology stack

| Layer | Technologies |
|---|---|
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Authentication | JWT, pwdlib password hashing |
| Data access | SQLAlchemy, Alembic |
| Database | PostgreSQL |
| Document processing | pypdf |
| Frontend | React, TypeScript, HTML, CSS |
| Testing | pytest, Playwright |
| Local delivery | Docker Compose |
| Cloud delivery | AWS EC2, Amazon ECR, AWS Systems Manager, GitHub Actions OIDC |
| Frontend hosting | Vercel |

## Run the full-stack application locally

Create local environment values before starting the services.

~~~bash
cp .env.example .env
~~~

Set at least `POSTGRES_PASSWORD` and `JWT_SECRET` in `.env`. Use a development-only JWT secret with at least 32 random characters.

Start the application from the repository root.

~~~bash
docker compose up -d --build
~~~

Open these URLs:

- React application: http://localhost:5174
- FastAPI documentation: http://localhost:8000/docs
- FastAPI health endpoint: http://localhost:8000/api/health

Upload a non-sensitive text PDF, review the extracted content, and refresh the application to verify PostgreSQL-backed persistence.

Stop the services with:

~~~bash
docker compose down
~~~

The named database and upload volumes remain available unless they are explicitly removed.

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

The local development interface is available at http://localhost:5174.

## Continuous integration

The GitHub Actions workflow validates the application with generated, non-sensitive PDF content. It checks:

- API validation and authentication behavior
- PDF upload and text extraction
- Document metadata and page persistence
- Browser interaction through the React interface
- End-to-end database behavior
- Frontend production build

## AWS deployment

The deployment workflow is [`.github/workflows/deploy-aws.yml`](.github/workflows/deploy-aws.yml).

It expects the shared AWS foundation to be provisioned and requires:

- Repository variable `AWS_ACCOUNT_ID`
- Repository secret `AWS_DEPLOY_ROLE_ARN`
- An AWS ECR repository for the document API
- An EC2 host registered for AWS Systems Manager
- The host deployment script used by the workflow

The backend reads its runtime configuration from environment variables. Keep database credentials and `JWT_SECRET` outside the repository.

## Repository structure

~~~text
intelligent-document-ai-platform/
├── backend/                    # FastAPI application, models, migrations, and tests
├── frontend/                   # React and TypeScript interface
├── deploy/                     # AWS deployment notes
├── infra/terraform/            # Infrastructure location reserved for cloud definitions
├── docs/                       # Architecture and API design notes
├── docker-compose.yml          # Local full-stack environment
└── .github/workflows/          # CI and AWS deployment workflows
~~~

## Engineering notes

- The supported document workflow currently handles PDFs with selectable text.
- Scanned or image-only PDFs are outside the current extraction workflow.
- Use non-sensitive sample PDFs during demonstrations.
- Uploaded documents and extracted pages are protected by authenticated, per-user access checks.
- Environment-specific values belong in local or cloud configuration and must not be committed.

## Status

The project has a live Vercel frontend connected to an AWS-hosted FastAPI backend. The deployed workflow supports account authentication, user-scoped document libraries, PDF upload, text extraction, PostgreSQL persistence, and page-by-page reading. Further work can extend the platform with background processing, OCR, semantic search, classification, and retrieval-augmented question answering.
