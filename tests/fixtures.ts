import { test as base } from '@playwright/test';
import { SalesforceApi } from './support/salesforce-api';
import { CaseFormPage } from './pages/case-form.page';
import { CaseRecordPage } from './pages/case-record.page';

interface Fixtures {
  api: SalesforceApi;
  /** A unique case subject for this test. Any case left with it is deleted afterwards. */
  subject: string;
  caseForm: CaseFormPage;
  caseRecord: CaseRecordPage;
}

export const test = base.extend<Fixtures>({
  api: async ({}, use) => {
    await use(SalesforceApi.fromSavedSession());
  },
  subject: async ({ api }, use, testInfo) => {
    const subject = `PW Demo ${Date.now()}-${testInfo.workerIndex}-${testInfo.retry}`;
    await use(subject);
    for (const record of await api.casesWithSubject(subject)) await api.deleteCase(record.Id);
  },
  caseForm: async ({ page }, use) => {
    await use(new CaseFormPage(page));
  },
  caseRecord: async ({ page }, use) => {
    await use(new CaseRecordPage(page));
  },
});

export { expect } from '@playwright/test';
