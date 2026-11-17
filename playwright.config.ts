import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const loginUrl = process.env.SF_LOGIN_URL ?? '';
// The Lightning app lives on a sibling domain of the login (My Domain) URL.
const lightningUrl = loginUrl.replace('.my.salesforce.com', '.lightning.force.com');
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const executablePath = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  workers: 2,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: lightningUrl,
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Every test gets a recording, shown on its page in the HTML report.
    video: { mode: 'on', size: { width: 1440, height: 900 } },
    proxy,
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    // Sign-in is not a test result, so it is not recorded.
    { name: 'setup', testMatch: /auth\.setup\.ts/, use: { video: 'off' } },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: '.auth/state.json' },
    },
  ],
});
