import type { Locator, Page } from '@playwright/test';
import { choosePicklistOption } from '../support/lightning';

/** One Salesforce screen (a form, a record page, a list). */
export class ExamplePage {
  readonly heading: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'New Example' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
  }

  async open() {
    await this.page.goto('/lightning/o/Example__c/new');
    await this.heading.waitFor();
  }

  async choose(label: string, option: string) {
    await choosePicklistOption(this.page, label, option);
  }

  async save() {
    await this.saveButton.click();
  }
}
