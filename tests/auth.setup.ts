import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';

const stateFile = '.auth/state.json';

// Logs in once and saves the session, so every test starts already signed in.
// If a saved session exists it is reused; a fresh login only happens when it has expired.
setup('sign in to Salesforce', async ({ browser }) => {
  const context = await browser.newContext(fs.existsSync(stateFile) ? { storageState: stateFile } : {});
  const page = await context.newPage();
  const appLauncher = page.getByRole('button', { name: 'App Launcher' });
  const username = page.getByRole('textbox', { name: 'Username' });

  await page.goto('/lightning/page/home');
  await expect(appLauncher.or(username)).toBeVisible({ timeout: 90_000 });

  if (await username.isVisible()) {
    const { SF_USERNAME, SF_PASSWORD } = process.env;
    if (!SF_USERNAME || !SF_PASSWORD) throw new Error('Set SF_USERNAME and SF_PASSWORD (see .env.example).');
    const password = page.getByRole('textbox', { name: 'Password' });
    const logIn = page.getByRole('button', { name: /log ?in/i });

    await username.fill(SF_USERNAME);
    if (!(await password.isVisible())) await logIn.click(); // some orgs ask for the username first
    await password.fill(SF_PASSWORD);
    await logIn.click();

    const verify = page.getByRole('heading', { name: 'Verify Your Identity' });
    await expect(appLauncher.or(verify)).toBeVisible({ timeout: 90_000 });
    if (await verify.isVisible()) {
      throw new Error(
        'Salesforce is asking for an emailed verification code because it does not recognise this machine. ' +
          'Log in once by hand with `npx playwright codegen --save-storage=.auth/state.json <login url>`, ' +
          'or add this network to the profile\'s Login IP Ranges.',
      );
    }
  }

  await fs.promises.mkdir('.auth', { recursive: true });
  await context.storageState({ path: stateFile });
  await context.close();
});
