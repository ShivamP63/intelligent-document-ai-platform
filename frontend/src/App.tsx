import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL } from "./api/client";

type Document = { id: string; original_filename: string; size_bytes: number; page_count: number; created_at: string; status: string };
type DocumentPage = { page_number: number; extracted_text: string };

async function json<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(API_BASE_URL + path, options);
  if (!response.ok) {
    const body = await response.text();
    try {
      const parsed = JSON.parse(body) as { detail?: string };
      throw new Error(parsed.detail ?? `API error ${response.status}`);
    } catch (err) {
      if (err instanceof SyntaxError) throw new Error(`API error ${response.status}`);
      throw err;
    }
  }
  return response.json() as Promise<T>;
}

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadDocuments() {
    try {
      const items = await json<Document[]>("/api/documents");
      setDocuments(items);
      setSelectedId(current => items.some(d => d.id === current) ? current : (items[0]?.id ?? ""));
    } catch (err) { setMessage(String(err)); }
  }
  useEffect(() => { void loadDocuments(); }, []);
  useEffect(() => {
    if (!selectedId) { setPages([]); return; }
    let cancelled = false;
    void json<DocumentPage[]>(`/api/documents/${selectedId}/pages`)
      .then(items => { if (!cancelled) setPages(items); })
      .catch(err => { if (!cancelled) setMessage(String(err)); });
    return () => { cancelled = true; };
  }, [selectedId]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || uploading) return;
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    setMessage("");
    try {
      const result = await json<Document>("/api/documents", { method: "POST", body: form });
      setMessage(`Uploaded ${result.original_filename} — extracted ${result.page_count} pages`);
      setFile(null);
      const input = document.getElementById("pdf-file") as HTMLInputElement | null;
      if (input) input.value = "";
      await loadDocuments();
      setSelectedId(result.id);
    } catch (err) { setMessage(String(err)); }
    finally { setUploading(false); }
  }
  const selected = documents.find(d => d.id === selectedId);

  return <main className="container">
    <header><p className="eyebrow">PORTFOLIO · SPRINT 1</p><h1>Intelligent Document Platform</h1><p>Upload text PDFs, browse your library, and inspect page-level extracted text.</p></header>
    <section className="card upload">
      <h2>Upload a document</h2>
      <form onSubmit={upload}>
        <label htmlFor="pdf-file">Choose a non-sensitive text PDF (up to 10 MB and 50 pages)</label>
        <div className="upload-controls"><input id="pdf-file" type="file" accept=".pdf,application/pdf" required onChange={e => setFile(e.target.files?.[0] ?? null)} /><button disabled={!file || uploading} type="submit">{uploading ? "Extracting…" : "Upload & extract"}</button></div>
      </form>
    </section>
    {message && <div role="status" className="notice">{message}</div>}
    <div className="columns">
      <section className="card"><h2>Library</h2>
        {documents.length === 0 && <p className="muted">No documents yet.</p>}
        <ul className="items">{documents.map(doc => <li key={doc.id}><button className={selectedId === doc.id ? "item-button selected" : "item-button"} onClick={() => setSelectedId(doc.id)}><strong>{doc.original_filename}</strong><small>{doc.page_count} pages · {(doc.size_bytes / 1024).toFixed(1)} KB · {doc.status}</small></button></li>)}</ul>
      </section>
      <section className="card"><h2>Extracted pages</h2>
        {!selected && <p className="muted">Upload or select a document to see its text.</p>}
        {selected && <><p className="selected-title">{selected.original_filename}</p>{pages.map(page => <article className="page" key={page.page_number}><h3>Page {page.page_number}</h3><pre>{page.extracted_text || "(No selectable text on this page)"}</pre></article>)}</>}
      </section>
    </div>
    <footer>Local prototype only · Classification, vector search, and RAG are planned for later milestones.</footer>
  </main>;
}
