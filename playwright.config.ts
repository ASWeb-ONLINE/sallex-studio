import { defineConfig } from '@playwright/test';

const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:4321';
const base = process.env.BASE_PATH || '/sallex-studio/';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  outputDir: 'reports/local-only/test-results',
  reporter: [['list'], ['json', { outputFile: 'reports/local-only/e2e-results.json' }]],
  use: {
    browserName: 'chromium',
    baseURL: `${origin}${base}`,
    viewport: { width: 1440, height: 900 },
    locale: 'ru-RU',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.TEST_ORIGIN ? undefined : {
    command: 'node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4321',
    url: `${origin}${base}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
