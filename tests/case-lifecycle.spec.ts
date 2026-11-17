import { test, expect } from './fixtures';

test.describe('Case lifecycle', () => {
  test('creates a case with its key details', async ({ caseForm, caseRecord, subject, api }) => {
    await caseForm.open();
    await caseForm.fill({
      subject,
      caseOrigin: 'Phone',
      priority: 'High',
      type: 'Electrical',
      description: 'Generator will not start after the scheduled service.',
    });
    await caseForm.save();

    await expect(caseRecord.createdMessage).toBeVisible();
    await expect(caseRecord.heading(subject)).toBeVisible();
    await expect(caseRecord.field('Status')).toContainText('New');
    await expect(caseRecord.field('Priority')).toContainText('High');
    await expect(caseRecord.field('Case Origin')).toContainText('Phone');
    await expect(caseRecord.field('Type')).toContainText('Electrical');

    // What the screen shows must match what was really saved.
    const [saved] = await api.casesWithSubject(subject);
    expect(saved).toMatchObject({ Status: 'New', Priority: 'High', Origin: 'Phone', Type: 'Electrical' });
    expect(saved.CaseNumber).toMatch(/^\d{8}$/);
  });

  test('does not save a case without a Case Origin', async ({ caseForm, subject, api }) => {
    await caseForm.open();
    await caseForm.fill({ subject, priority: 'Medium' });
    await caseForm.save();

    await expect(caseForm.errorDialog).toBeVisible();
    await expect(caseForm.errorFieldLink('Case Origin')).toBeVisible();

    await caseForm.closeErrorDialog();
    await expect(caseForm.heading).toBeVisible();
    expect(await api.casesWithSubject(subject)).toHaveLength(0);
  });

  test('escalates a case from its record page', async ({ caseRecord, subject, api }) => {
    const caseId = await api.createCase({ Subject: subject, Origin: 'Web', Priority: 'High' });
    await caseRecord.open(caseId);
    await expect(caseRecord.heading(subject)).toBeVisible();

    await caseRecord.changePicklist('Status', 'Escalated');

    await expect(caseRecord.field('Status')).toContainText('Escalated');
    const [saved] = await api.casesWithSubject(subject);
    expect(saved.Status).toBe('Escalated');
  });
});
