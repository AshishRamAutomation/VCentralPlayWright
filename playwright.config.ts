import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 90000,
  testDir: './tests',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['./custom-reporter.ts'] ,
     ['html'], 
    ['allure-playwright', { resultsDir: 'allure-results' }]
  ],// Hooking your HTML layout engine up
  
  use: {
    screenshot: 'on', // Force Playwright to snap images for the cards
  
    // Automatically attach artifacts to your Allure report on failure

    video: 'retain-on-failure',
    trace: 'on-first-retry',
  
    baseURL: 'https://yashtech-tst1.outsystemsenterprise.com',
   
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
