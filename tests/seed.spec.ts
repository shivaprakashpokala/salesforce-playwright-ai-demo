import { test, expect } from './fixtures';

// Starting point for the Playwright planner and generator agents:
// every generated test begins signed in, on the Cases list.
test.describe('Cases', () => {
  test('seed', async ({ page }) => {
    await page.goto('/lightning/o/Case/list');
    await expect(page.getByRole('button', { name: 'New', exact: true })).toBeVisible();
  });
});
