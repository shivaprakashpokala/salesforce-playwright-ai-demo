import type { Locator, Page } from '@playwright/test';
import { choosePicklistOption } from '../support/lightning';

/** A saved case, as shown on its record page. */
export class CaseRecordPage {
  readonly createdMessage: Locator;
  readonly deletedMessage: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteDialog: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.createdMessage = page.getByText(/Case "\d+" was created\./);
    this.deletedMessage = page.getByText(/Case "\d+" was deleted\./);
    this.deleteButton = page.getByRole('button', { name: 'Delete', exact: true });
    this.confirmDeleteDialog = page.getByRole('dialog', { name: 'Delete Case' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
  }

  async open(caseId: string) {
    await this.page.goto(`/lightning/r/Case/${caseId}/view`);
  }

  heading(subject: string): Locator {
    return this.page.getByRole('heading', { name: subject, level: 1 });
  }

  /**
   * One field on the Details tab, label and value together.
   * Salesforce gives every field an "Edit <label>" button, which is the stable way to find it.
   */
  field(label: string): Locator {
    return this.page
      .locator('records-record-layout-item')
      .filter({ has: this.page.getByRole('button', { name: `Edit ${label}`, exact: true }) });
  }

  /** Change a picklist field in place on the Details tab and save. */
  async changePicklist(label: string, option: string) {
    await this.page.getByRole('button', { name: `Edit ${label}`, exact: true }).click();
    await choosePicklistOption(this.page, label, option);
    await this.saveButton.click();
  }

  async delete() {
    await this.deleteButton.click();
    await this.confirmDeleteDialog.getByRole('button', { name: 'Delete', exact: true }).click();
  }
}
