import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './demo-tests',
  timeout: 30000,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5174' },
});
