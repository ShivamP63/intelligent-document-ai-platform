import { useEffect, useState, type FormEvent } from "react";
import { API_BASE_URL } from "./api/client";
import { isHostedDemo, getDemoDocuments, getDemoPages, uploadDemoDocument } from "./api/demo";

type Document = { id: string; original_filename: string; size_bytes: number; page_count: number; created_at: string; status: string };
type DocumentPage = { page_number: number; extracted_text: string };

async function json<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const token = localStorage.getItem('docai_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(API_BASE_URL + path, { ...options, headers });
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
  const [token, setToken] = useState(() => localStorage.getItem('docai_token') ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState(false);

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await json<{ access_token: string }>(`/api/auth/${register ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      localStorage.setItem('docai_token', result.access_token); setToken(result.access_token); setMessage('Signed in');
    } catch (err) { setMessage(String(err)); }
  }

  async function loadDocuments() {
    try {
      const items = isHostedDemo ? getDemoDocuments() : await json<Document[]>("/api/documents");
      setDocuments(items);
      setSelectedId(current => items.some(d => d.id === current) ? current : (items[0]?.id ?? ""));
    } catch (err) { setMessage(String(err)); }
  }
  useEffect(() => { if (isHostedDemo || token) void loadDocuments(); }, [token]);
  useEffect(() => {
    if (!selectedId) { setPages([]); return; }
    let cancelled = false;
    void (isHostedDemo ? Promise.resolve(getDemoPages(selectedId)) : json<DocumentPage[]>(`/api/documents/${selectedId}/pages`))
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
      const result = isHostedDemo ? await uploadDemoDocument(file) : await json<Document>("/api/documents", { method: "POST", body: form });
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

  if (!isHostedDemo && !token) return <main className="container"><header><h1>Intelligent Document Platform</h1><p>Sign in to use the AWS-backed API.</p></header><section className="card upload"><h2>{register ? 'Create account' : 'Sign in'}</h2><form onSubmit={authenticate}><input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><input type="password" required minLength={8} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><button type="submit">{register ? 'Register' : 'Login'}</button></form><button onClick={() => setRegister(v => !v)}>{register ? 'Use existing account' : 'Create an account'}</button>{message && <div role="status" className="notice">{message}</div>}</section></main>;

  return <main className="container">
    <header><p className="eyebrow">PORTFOLIO · SPRINT 1</p><h1>Intelligent Document Platform</h1><p>Upload text PDFs, browse your library, and inspect page-level extracted text.</p></header>
    <section className="card upload">
      <h2>Upload a document</h2>
      <form onSubmit={upload}>
        <label htmlFor="pdf-file">Choose a non-sensitive text PDF (up to 10 MB and 50 pages)</label>
        <div className="upload-controls"><input id="pdf-file" type="file" accept=".pdf,application/pdf" required onChange={e => setFile(e.target.files?.[0] ?? null)} /><button disabled={!file || uploading} type="submit">{uploading ? "Extracting…" : "Upload & extract"}</button></div>
      </form>
    </section>
    {isHostedDemo && <div className="notice"><strong>Interactive browser-only demo.</strong> PDF extraction and saved text stay in this browser; nothing is uploaded to a server. The real Python/FastAPI + PostgreSQL app is implemented and tested in the GitHub repository.</div>}
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
    <footer>{isHostedDemo ? "Public preview: browser-only processing and storage · No server uploads" : "Local prototype only · Classification, vector search, and RAG are planned for later milestones."}</footer>
  </main>;
}
