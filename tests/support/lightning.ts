import { expect, type Page } from '@playwright/test';

/**
 * Pick a value in a Lightning picklist.
 *
 * Lightning re-renders its forms while they load, which can close a dropdown a
 * moment after it opens. So we retry "open the list, click the option" as one
 * unit until it sticks, then confirm the picklist shows the chosen value.
 */
export async function choosePicklistOption(page: Page, label: string, option: string) {
  const picklist = page.getByRole('combobox', { name: label, exact: true });
  const item = page.getByRole('option', { name: option, exact: true }).filter({ visible: true });

  await expect(async () => {
    if (!(await item.isVisible())) await picklist.click({ timeout: 5_000 });
    await item.click({ timeout: 3_000 });
    await expect(picklist).toContainText(option, { timeout: 3_000 });
  }).toPass({ timeout: 60_000 });
}
