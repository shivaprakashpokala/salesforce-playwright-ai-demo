// spec: specs/case-lifecycle-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures';

const generatorFault =
  'Customer reports their standby generator will not start after a power cut. ' +
  'The control panel lights up but the engine does not turn over.';

test.describe('Case lifecycle', () => {
  test('creates a case with its key details', async ({ caseForm, caseRecord, subject, api }) => {
    await caseForm.open();

    // Rule 2: a new case starts as Status New and Priority Medium.
    await expect(caseForm.picklist('Status')).toContainText('New');
    await expect(caseForm.picklist('Priority')).toContainText('Medium');
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');

    await caseForm.fill({
      subject,
      caseOrigin: 'Phone',
      priority: 'High',
      type: 'Electrical',
      description: generatorFault,
    });
    await caseForm.save();

    // On the screen
    await expect(caseRecord.createdMessage).toBeVisible();
    const toast = await caseRecord.createdMessage.textContent();
    await expect(caseRecord.heading(subject)).toBeVisible();
    await expect(caseRecord.field('Status')).toContainText('New');
    await expect(caseRecord.field('Priority')).toContainText('High');
    await expect(caseRecord.field('Case Origin')).toContainText('Phone');
    await expect(caseRecord.field('Type')).toContainText('Electrical');

    // Through the API
    const saved = await api.casesWithSubject(subject);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ Status: 'New', Priority: 'High', Origin: 'Phone', Type: 'Electrical' });
    expect(saved[0].CaseNumber).toMatch(/^\d{8}$/);
    expect(toast).toContain(`Case "${saved[0].CaseNumber}" was created.`);
  });

  test('does not save a case without a Case Origin', async ({ caseForm, caseRecord, subject, api }) => {
    await caseForm.open();
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');

    await caseForm.fill({ subject, description: generatorFault });
    await caseForm.save();

    // Rule 1: Salesforce refuses the save and names the missing field.
    await expect(caseForm.errorDialog).toBeVisible();
    await expect(caseForm.errorFieldLink('Case Origin')).toBeVisible();
    await expect(caseRecord.createdMessage).toBeHidden();

    // The agent's work is kept on the form.
    await caseForm.closeErrorDialog();
    await expect(caseForm.heading).toBeVisible();
    await expect(caseForm.subject).toHaveValue(subject);

    expect(await api.casesWithSubject(subject)).toHaveLength(0);
  });

  test('escalates a case from its record page', async ({ caseRecord, subject, api }) => {
    const caseId = await api.createCase({ Subject: subject, Origin: 'Phone' });

    await caseRecord.open(caseId);
    await expect(caseRecord.heading(subject)).toBeVisible();
    await expect(caseRecord.field('Status')).toContainText('New');

    await caseRecord.changePicklist('Status', 'Escalated');

    // On the screen
    await expect(caseRecord.saveButton).toBeHidden();
    await expect(caseRecord.field('Status')).toContainText('Escalated');

    // Rule 4: the escalation is recorded in the case feed as a status change.
    await caseRecord.open(caseId);
    await caseRecord.openFeed();
    await expect(caseRecord.statusChangeInFeed('New', 'Escalated')).toBeVisible();

    // Through the API
    const saved = await api.casesWithSubject(subject);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ Status: 'Escalated', Priority: 'Medium', Origin: 'Phone' });
  });
});
