import { test as setup, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import { Connection } from 'jsforce';
import { connectWithJwt, frontDoorUrl, jwtConfigured, saveSession } from './support/salesforce-auth';

const stateFile = '.auth/state.json';

/**
 * Signs in once and saves the result, so every test starts already signed in.
 *
 * Preferred: JWT bearer flow. No password, no verification code, works on any machine.
 * Fallback: username and password through the login page, for orgs without a JWT app.
 */
setup('sign in to Salesforce', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const appLauncher = page.getByRole('button', { name: 'App Launcher' });

  if (jwtConfigured()) {
    const connection = await connectWithJwt();
    saveSession(connection);
    await page.goto(await frontDoorUrl(connection));
  } else {
    saveSession(await signInWithPassword(page));
  }

  await expect(appLauncher, 'Salesforce did not open the Lightning home page after sign-in').toBeVisible({ timeout: 90_000 });
  await fs.promises.mkdir('.auth', { recursive: true });
  await context.storageState({ path: stateFile });
  await context.close();
});

/** Fallback sign-in through the login page. Salesforce may ask for an emailed code on a new machine. */
async function signInWithPassword(page: Page): Promise<Connection> {
  const { SF_LOGIN_URL, SF_USERNAME, SF_PASSWORD } = process.env;
  if (!SF_LOGIN_URL || !SF_USERNAME || !SF_PASSWORD) {
    throw new Error('Set SF_CLIENT_ID and a private key for JWT sign-in, or SF_USERNAME and SF_PASSWORD (see .env.example).');
  }
  const username = page.getByRole('textbox', { name: 'Username' });
  const password = page.getByRole('textbox', { name: 'Password' });
  const logIn = page.getByRole('button', { name: /log ?in/i });
  const appLauncher = page.getByRole('button', { name: 'App Launcher' });
  const verify = page.getByRole('heading', { name: 'Verify Your Identity' });

  await page.goto(SF_LOGIN_URL);
  await username.fill(SF_USERNAME);
  if (!(await password.isVisible())) await logIn.click(); // some orgs ask for the username first
  await password.fill(SF_PASSWORD);
  await logIn.click();

  await expect(appLauncher.or(verify)).toBeVisible({ timeout: 90_000 });
  if (await verify.isVisible()) {
    throw new Error(
      'Salesforce is asking for an emailed verification code because it does not recognise this machine. ' +
        'Use JWT sign-in instead (SF_CLIENT_ID and SF_PRIVATE_KEY_PATH, see README).',
    );
  }

  // The browser session doubles as the API session in this mode.
  const session = (await page.context().cookies()).find((c) => c.name === 'sid' && c.domain.endsWith('.my.salesforce.com'));
  if (!session) throw new Error('Signed in, but found no Salesforce session cookie for the API.');
  return new Connection({
    instanceUrl: `https://${session.domain.replace(/^\./, '')}`,
    accessToken: session.value,
    ...(process.env.HTTPS_PROXY ? { httpProxy: process.env.HTTPS_PROXY } : {}),
  });
}
