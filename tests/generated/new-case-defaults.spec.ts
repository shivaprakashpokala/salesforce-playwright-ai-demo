// spec: specs/case-lifecycle-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Creating a case', () => {
  test('New case defaults to Status New and Priority Medium', async ({ page }) => {
    await page.goto('/lightning/o/Case/list');

    // 1. Select New on the Cases list
    await page.getByRole('button', { name: 'New', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'New Case' })).toBeVisible();

    // expect: Status shows New
    await expect(page.getByRole('combobox', { name: 'Status', exact: true })).toContainText('New');

    // expect: Priority shows Medium
    await expect(page.getByRole('combobox', { name: 'Priority', exact: true })).toContainText('Medium');
  });
});
