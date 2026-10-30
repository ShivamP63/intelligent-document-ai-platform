from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.documents import router as documents_router

app = FastAPI(title="Intelligent Document API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174","http://127.0.0.1:5174"],
    allow_methods=["GET","POST"],
    allow_headers=["Content-Type"],
)
app.include_router(health_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
