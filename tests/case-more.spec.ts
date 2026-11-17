import { test, expect } from './fixtures';

// More Case scenarios. These stay in place during the demo;
// tests/case-lifecycle.spec.ts is the file the demo deletes and regenerates.
test.describe('Case lifecycle: more scenarios', () => {
  test('does not save a case when the form is cancelled', async ({ caseForm, subject, api }) => {
    await caseForm.open();
    await caseForm.fill({ subject, caseOrigin: 'Email' });
    await caseForm.cancel();

    await expect(caseForm.heading).toBeHidden();
    expect(await api.casesWithSubject(subject)).toHaveLength(0);
  });

  test('deletes a case', async ({ caseRecord, subject, api }) => {
    const caseId = await api.createCase({ Subject: subject, Origin: 'Phone' });
    await caseRecord.open(caseId);
    await expect(caseRecord.heading(subject)).toBeVisible();

    await caseRecord.delete();

    await expect(caseRecord.deletedMessage).toBeVisible();
    expect(await api.casesWithSubject(subject)).toHaveLength(0);
  });
});
