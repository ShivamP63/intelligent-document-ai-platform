import { test, expect } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';

test('an account can upload, reopen, and read its PDF after signing in again', async ({ page }) => {
  const filename = 'browser-smoke-' + Date.now() + '.pdf';
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const sheet = pdf.addPage([612, 792]);
  sheet.drawText('Portfolio browser smoke: selectable PDF text', {
    x: 70, y: 700, size: 13, font,
  });
  const buffer = Buffer.from(await pdf.save());

  const email = `reader-${Date.now()}@example.com`;
  const password = 'Local-test-password-42';
  await page.goto('/');
  await page.getByRole('button', { name: 'Create an account' }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Document workspace' })).toBeVisible();
  await page.locator('#pdf-file').setInputFiles({
    name: filename,
    mimeType: 'application/pdf',
    buffer,
  });
  await page.getByRole('button', { name: 'Upload & extract' }).click();
  await expect(page.getByRole('status')).toContainText('Uploaded ' + filename);
  await expect(page.locator('.page pre')).toContainText('Portfolio browser smoke');

  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('.page pre')).toContainText('Portfolio browser smoke');
  await page.reload();
  await expect(page.getByRole('button', { name: new RegExp(filename) })).toBeVisible();
  await expect(page.locator('.page pre')).toContainText('Portfolio browser smoke');
});
