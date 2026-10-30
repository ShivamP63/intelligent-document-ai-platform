import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from app.db import Base, get_db
from app.api.documents import get_storage_dir
from app.main import app
import app.models

@pytest.fixture
def client(tmp_path):
    engine = create_engine("sqlite+pysqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)

    def override_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_storage_dir] = lambda: tmp_path / "uploads"
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    engine.dispose()
