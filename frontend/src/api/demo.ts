/**
 * Public portfolio preview only: PDF extraction happens fully in the visitor's browser.
 * No PDFs, document text, or metadata are uploaded to the server.
 * This is separate from the real FastAPI/PostgreSQL app verified by GitHub Actions.
 */
export const isHostedDemo =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  !import.meta.env.VITE_API_BASE_URL;

export type DemoDocument = {
  id: string; original_filename: string; size_bytes: number;
  page_count: number; created_at: string; status: string;
};
export type DemoPage = { page_number: number; extracted_text: string };
type State = { documents: DemoDocument[]; pages: Record<string, DemoPage[]> };
const key = 'portfolio-document-browser-demo-v1';
const sample: State = {
  documents: [{
    id: 'sample-document',
    original_filename: 'Welcome - example content (sample)',
    size_bytes: 190,
    page_count: 1,
    created_at: '2026-11-13T00:00:00Z',
    status: 'SAMPLE',
  }],
  pages: {
    'sample-document': [{
      page_number: 1,
      extracted_text: 'This is sample content in a browser-only portfolio preview.\nUpload a non-sensitive, text-based PDF to see its extracted pages.\nNo files or extracted text leave this browser.',
    }],
  },
};
function read(): State {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return structuredClone(sample);
    const parsed = JSON.parse(stored) as State;
    return Array.isArray(parsed.documents) && parsed.pages ? parsed : structuredClone(sample);
  } catch { return structuredClone(sample); }
}
function write(value: State) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { throw new Error('Browser storage is full or disabled; try a smaller PDF or clear demo data'); }
}
export function getDemoDocuments(): DemoDocument[] {
  return read().documents;
}
export function getDemoPages(id: string): DemoPage[] {
  return read().pages[id] ?? [];
}
export async function uploadDemoDocument(file: File): Promise<DemoDocument> {
  if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('Only PDF documents are supported');
  if (file.size > 10 * 1024 * 1024) throw new Error('PDF exceeds the 10 MB limit');
  if (file.size === 0) throw new Error('Empty PDFs are not supported');

  // pdf.js runs locally in the browser; its worker is packaged with Vite.
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  let pdf: Awaited<ReturnType<typeof pdfjs.getDocument>>['promise'] extends Promise<infer T> ? T : never;
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const task = pdfjs.getDocument({ data: buffer, useSystemFonts: true });
    pdf = await task.promise;
  } catch {
    throw new Error('PDF could not be opened. Please select a valid, unencrypted text PDF');
  }
  try {
    if (pdf.numPages < 1 || pdf.numPages > 50) throw new Error('PDF must have 1–50 pages');
    const pages: DemoPage[] = [];
    let totalChars = 0;
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index);
      const text = await page.getTextContent();
      const extracted = text.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ').trim();
      totalChars += extracted.length;
      if (totalChars > 1_000_000) throw new Error('Extracted document text is too large');
      pages.push({ page_number: index, extracted_text: extracted });
    }
    if (!pages.some(p => p.extracted_text)) throw new Error('No selectable text found; scanned PDFs are not supported');
    const doc: DemoDocument = {
      id: crypto.randomUUID(), original_filename: file.name, size_bytes: file.size,
      page_count: pages.length, created_at: new Date().toISOString(), status: 'PROCESSED LOCALLY',
    };
    const state = read();
    state.documents.unshift(doc);
    state.pages[doc.id] = pages;
    write(state);
    return doc;
  } finally {
    await pdf.destroy();
  }
}
