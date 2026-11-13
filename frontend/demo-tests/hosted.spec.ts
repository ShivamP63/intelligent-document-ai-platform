import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';

test('hosted document preview extracts a PDF in-browser, persists text, and never uses API', async ({ page }) => {
  const apiRequests: string[] = [];
  page.on('request', r => { if (new URL(r.url()).pathname.startsWith('/api/')) apiRequests.push(r.url()); });
  const filename = 'hosted-browser-test-' + Date.now() + '.pdf';
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.addPage([612, 792]).drawText('Browser only document extraction proof', {
    x: 70, y: 700, size: 14, font,
  });
  const buffer = Buffer.from(await pdf.save());
  await page.goto('/');
  await expect(page.getByText(/Interactive browser-only demo/)).toBeVisible();
  await page.locator('#pdf-file').setInputFiles({ name: filename, mimeType: 'application/pdf', buffer });
  await page.getByRole('button', { name: 'Upload & extract' }).click();
  await expect(page.getByRole('status')).toContainText('Uploaded ' + filename);
  await expect(page.locator('.page pre')).toContainText('Browser only document extraction proof');
  await page.reload();
  await expect(page.getByRole('button', { name: new RegExp(filename) })).toBeVisible();
  await expect(page.locator('.page pre')).toContainText('Browser only document extraction proof');
  expect(apiRequests).toEqual([]);
});
