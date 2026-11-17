import type { Locator, Page } from '@playwright/test';
import { choosePicklistOption } from '../support/lightning';

export interface CaseDetails {
  subject: string;
  caseOrigin?: 'Phone' | 'Email' | 'Web';
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'New' | 'Working' | 'Escalated';
  type?: 'Mechanical' | 'Electrical' | 'Electronic' | 'Structural' | 'Other';
  caseReason?: string;
  product?: string;
  description?: string;
}

/** The "New Case" form that opens from the Cases tab. */
export class CaseFormPage {
  readonly heading: Locator;
  readonly subject: Locator;
  readonly description: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly errorDialog: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'New Case' });
    this.subject = page.getByRole('textbox', { name: 'Subject' });
    this.description = page.getByRole('textbox', { name: 'Description', exact: true });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true });
    this.errorDialog = page.getByRole('dialog', { name: 'We hit a snag.' });
  }

  async open() {
    await this.page.goto('/lightning/o/Case/new');
    await this.heading.waitFor();
    await this.saveButton.waitFor();
  }

  picklist(label: string): Locator {
    return this.page.getByRole('combobox', { name: label, exact: true });
  }

  /** The link inside the error dialog that names a field needing attention. */
  errorFieldLink(label: string): Locator {
    return this.errorDialog.getByRole('link', { name: label, exact: true });
  }

  async choose(label: string, option: string) {
    await choosePicklistOption(this.page, label, option);
  }

  async fill(details: CaseDetails) {
    if (details.status) await this.choose('Status', details.status);
    if (details.priority) await this.choose('Priority', details.priority);
    if (details.caseOrigin) await this.choose('Case Origin', details.caseOrigin);
    if (details.type) await this.choose('Type', details.type);
    if (details.caseReason) await this.choose('Case Reason', details.caseReason);
    if (details.product) await this.choose('Product', details.product);
    await this.subject.fill(details.subject);
    if (details.description) await this.description.fill(details.description);
  }

  /** The form behind the error dialog is hidden from assistive technology until the dialog is closed. */
  async closeErrorDialog() {
    await this.errorDialog.getByRole('button', { name: 'Close error dialog' }).click();
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
