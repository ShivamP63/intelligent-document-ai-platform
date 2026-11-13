import { test, expect } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';

test('PDF upload, page extraction, and refresh work in the browser', async ({ page }) => {
  const filename = 'browser-smoke-' + Date.now() + '.pdf';
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const sheet = pdf.addPage([612, 792]);
  sheet.drawText('Portfolio browser smoke: selectable PDF text', {
    x: 70, y: 700, size: 13, font,
  });
  const buffer = Buffer.from(await pdf.save());

  await page.goto('/');
  await page.locator('#pdf-file').setInputFiles({
    name: filename,
    mimeType: 'application/pdf',
    buffer,
  });
  await page.getByRole('button', { name: 'Upload & extract' }).click();
  await expect(page.getByRole('status')).toContainText('Uploaded ' + filename);
  await expect(page.locator('.page pre')).toContainText('Portfolio browser smoke');

  await page.reload();
  await expect(page.getByRole('button', { name: new RegExp(filename) })).toBeVisible();
  await expect(page.locator('.page pre')).toContainText('Portfolio browser smoke');
});
