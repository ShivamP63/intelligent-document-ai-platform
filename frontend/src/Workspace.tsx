import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Brand from './Brand';
import { getDemoDocuments, getDemoPages, isHostedDemo, uploadDemoDocument } from './api/demo';
import { ApiError, errorMessage, requestJson } from './api/request';

type DocumentSummary = { id: string; original_filename: string; size_bytes: number; page_count: number; status: string };
type DocumentPage = { page_number: number; extracted_text: string };
type Feedback = { text: string; error?: boolean };

function pageCount(count: number) {
  return `${count} ${count === 1 ? 'page' : 'pages'}`;
}

export default function Workspace({ onSignOut }: { onSignOut: (reason?: string) => void }) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = documents.find(doc => doc.id === selectedId);

  const reportError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 401 && !isHostedDemo) {
      onSignOut('Your session has expired. Sign in again to open your library.');
      return;
    }
    setFeedback({ text: errorMessage(error), error: true });
  }, [onSignOut]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function loadLibrary() {
      setLoading(true);
      try {
        const items = isHostedDemo ? getDemoDocuments() : await requestJson<DocumentSummary[]>('/api/documents', { signal: controller.signal });
        if (active) {
          setDocuments(items);
          setSelectedId(id => items.some(doc => doc.id === id) ? id : (items[0]?.id ?? ''));
        }
      } catch (error) {
        if (active) reportError(error);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadLibrary();
    return () => { active = false; controller.abort(); };
  }, [refresh, reportError]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    const controller = new AbortController();
    async function readPages() {
      setReading(true);
      setPages([]);
      try {
        const items = isHostedDemo ? getDemoPages(selectedId) : await requestJson<DocumentPage[]>(`/api/documents/${selectedId}/pages`, { signal: controller.signal });
        if (active) setPages(items);
      } catch (error) {
        if (active) reportError(error);
      } finally {
        if (active) setReading(false);
      }
    }
    void readPages();
    return () => { active = false; controller.abort(); };
  }, [selectedId, reportError]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || uploading) return;
    setUploading(true);
    setFeedback(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const result = isHostedDemo ? await uploadDemoDocument(file) : await requestJson<DocumentSummary>('/api/documents', { method: 'POST', body: form });
      setDocuments(items => [result, ...items.filter(item => item.id !== result.id)]);
      setSelectedId(result.id);
      setRefresh(value => value + 1);
      setFeedback({ text: `Uploaded ${result.original_filename} — extracted ${pageCount(result.page_count)}.` });
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (error) {
      reportError(error);
    } finally {
      setUploading(false);
    }
  }

  return <>
    <header className="app-bar"><div className="wrap bar-inner"><Brand />
      {!isHostedDemo && <button className="quiet-button" type="button" onClick={() => onSignOut()}>Sign out</button>}
    </div></header>
    <main className="wrap workspace">
      <h1>Document workspace</h1>
      <p className="intro">Upload a PDF and read its text, page by page.</p>
      {isHostedDemo && <p className="local-note"><strong>Browser-only workspace.</strong> Files and extracted text stay in this browser.</p>}
      <section className="upload-panel" aria-labelledby="upload-title">
        <div className="upload-label"><span className="upload-icon" aria-hidden="true">↑</span>
          <div><h2 id="upload-title">Upload a document</h2><p id="upload-hint">Text-based PDF · Up to 10 MB and 50 pages</p></div>
        </div>
        <form className="upload-form" onSubmit={upload}>
          <div className="file-choice">
            <input ref={fileInput} id="pdf-file" type="file" accept=".pdf,application/pdf" aria-describedby="upload-hint"
              required disabled={uploading} onChange={event => { setFile(event.target.files?.[0] ?? null); setFeedback(null); }} />
            <label htmlFor="pdf-file"><span className="paper-icon" aria-hidden="true" /><span>{file ? file.name : 'Choose PDF'}</span></label>
          </div>
          <button className="primary" type="submit" disabled={!file || uploading}>{uploading ? 'Extracting…' : 'Upload & extract'}</button>
        </form>
      </section>
      {feedback && <div className={`feedback ${feedback.error ? 'error' : 'success'}`} role={feedback.error ? 'alert' : 'status'}>{feedback.text}</div>}
      <div className="workspace-grid">
        <section className="library-panel" aria-labelledby="library-title">
          <div className="panel-head"><h2 id="library-title">Library</h2>{!loading && <span className="count" aria-label={`${documents.length} documents`}>{documents.length}</span>}</div>
          {loading && documents.length === 0 && <p className="panel-note">Loading documents…</p>}
          {!loading && documents.length === 0 && <p className="panel-note">Your uploaded PDFs will appear here.</p>}
          <ul className="doc-list">{documents.map(doc => <li key={doc.id}>
            <button className="doc-button" aria-pressed={selectedId === doc.id} onClick={() => setSelectedId(doc.id)}>
              <span className="file-symbol" aria-hidden="true"><span className="paper-icon" /></span>
              <span className="doc-info"><strong>{doc.original_filename}</strong><small>{pageCount(doc.page_count)} · {(doc.size_bytes / 1024).toFixed(1)} KB</small><small>{doc.status}</small></span>
            </button>
          </li>)}</ul>
        </section>
        <section className="reader-panel" aria-labelledby="reader-title">
          <div className="panel-head"><h2 id="reader-title">Extracted pages</h2>{selected && <span className="reader-count">{pageCount(selected.page_count)}</span>}</div>
          {!selected ? <div className="reader-empty"><span className="empty-sheets" aria-hidden="true"><i /><i /></span>
            <h3>Your document reader</h3><p>Select a PDF from your library to see its extracted text.</p>
          </div> : <div className="reader-content">
            <h3 className="document-name">{selected.original_filename}</h3>
            {reading && <p className="panel-note">Loading pages…</p>}
            {pages.map(page => <article className="page" key={page.page_number}>
              <h4>Page {page.page_number}</h4><pre>{page.extracted_text || 'No selectable text on this page.'}</pre>
            </article>)}
          </div>}
        </section>
      </div>
    </main>
  </>;
}
