import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './test/e2e',
  timeout: 60_000,
  use: {
    headless: true,
    baseURL: 'http://localhost:4000',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: 'npm run start',
    port: 4000,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
};

export default config;
