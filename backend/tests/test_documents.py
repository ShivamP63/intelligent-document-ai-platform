from io import BytesIO
from uuid import uuid4
from reportlab.pdfgen import canvas
from pypdf import PdfWriter

def sample_text_pdf() -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.drawString(80, 730, "Portfolio PDF document with selectable text")
    pdf.save()
    return buffer.getvalue()

def test_upload_list_detail_and_pages(client):
    response = client.post("/api/documents", files={"file": ("sample.pdf", sample_text_pdf(), "application/pdf")})
    assert response.status_code == 201, response.text
    doc = response.json()
    assert doc["original_filename"] == "sample.pdf"
    assert doc["page_count"] == 1
    document_id = doc["id"]
    assert len(client.get("/api/documents").json()) == 1
    assert client.get(f"/api/documents/{document_id}").status_code == 200
    pages = client.get(f"/api/documents/{document_id}/pages").json()
    assert pages[0]["page_number"] == 1
    assert "selectable text" in pages[0]["extracted_text"]

def test_reject_invalid_signature(client):
    response = client.post("/api/documents", files={"file": ("bad.pdf", b"not a pdf", "application/pdf")})
    assert response.status_code == 422

def test_reject_other_extension(client):
    response = client.post("/api/documents", files={"file": ("bad.txt", b"text", "text/plain")})
    assert response.status_code == 415

def test_reject_image_only_pdf(client):
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    output = BytesIO()
    writer.write(output)
    response = client.post("/api/documents", files={"file": ("blank.pdf", output.getvalue(), "application/pdf")})
    assert response.status_code == 422

def test_missing_document_returns_404(client):
    assert client.get(f"/api/documents/{uuid4()}").status_code == 404
