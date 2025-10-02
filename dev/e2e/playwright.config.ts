import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: false, // Show the browser
  },
  webServer: {
    command: 'npm --prefix /Users/william.thibault/Documents/github/pickup/dev/front-end run preview -- --port=4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
