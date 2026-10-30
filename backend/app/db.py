from collections.abc import Iterator
from functools import lru_cache
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session

DEFAULT_DB_URL = "postgresql+psycopg://docai_dev:change_me_local_only@localhost:5434/docai_local"

class Base(DeclarativeBase):
    pass

@lru_cache(maxsize=1)
def get_engine():
    return create_engine(os.getenv("DATABASE_URL", DEFAULT_DB_URL), pool_pre_ping=True)

def get_db() -> Iterator[Session]:
    with Session(get_engine()) as session:
        yield session
