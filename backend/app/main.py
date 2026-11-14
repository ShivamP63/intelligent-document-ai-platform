import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router

app = FastAPI(title="Intelligent Document API", version="0.1.0")
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:5174,http://127.0.0.1:5174,https://intelligent-document-ai-demo.vercel.app").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET","POST"], allow_headers=["Authorization","Content-Type"])
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
