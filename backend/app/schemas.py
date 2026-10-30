from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    original_filename: str
    content_type: str
    size_bytes: int
    page_count: int
    status: str
    created_at: datetime

class DocumentPageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    page_number: int
    extracted_text: str
