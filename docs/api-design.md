# API — Sprint 1 (implemented source, pending full deployment verification)

| Method | Route | Description |
|---|---|---|
| GET | /api/health | Health endpoint |
| POST | /api/documents | Upload <=10 MB text PDF, extract selectable text and save metadata/page text |
| GET | /api/documents | List newest 50 documents |
| GET | /api/documents/{id} | Document metadata |
| GET | /api/documents/{id}/pages | Extracted text by page |

Invalid extension/content type: 415; invalid/scanned/encrypted PDF: 422; too large: 413; missing record: 404.

Later: document classification, keyword/semantic search, citations and RAG.
