import { test, expect } from './fixtures';

// Generated from specs/case-lifecycle-plan.md (user story: docs/case-user-story.md).
// Expected results follow the business rules in the case-domain skill.
test.describe('Case lifecycle', () => {
  test('creates a case with its key details', async ({ caseForm, caseRecord, subject, api }) => {
    await caseForm.open();

    // Business rule 2: a new case starts as Status New and Priority Medium.
    await expect(caseForm.picklist('Status')).toContainText('New');
    await expect(caseForm.picklist('Priority')).toContainText('Medium');
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');

    await caseForm.fill({
      subject,
      caseOrigin: 'Phone',
      priority: 'High',
      type: 'Electrical',
      description: 'Customer reports the standby generator will not start after the power cut last night.',
    });
    await caseForm.save();

    // Acceptance criterion 3: a confirmation with an eight-digit Case Number.
    await expect(caseRecord.createdMessage).toHaveText(/^Case "\d{8}" was created\.$/);
    const caseNumber = (await caseRecord.createdMessage.textContent())?.match(/"(\d{8})"/)?.[1];
    expect(caseNumber).toMatch(/^\d{8}$/);

    await expect(caseRecord.heading(subject)).toBeVisible();
    await expect(caseRecord.field('Status')).toContainText('New');
    await expect(caseRecord.field('Priority')).toContainText('High');
    await expect(caseRecord.field('Case Origin')).toContainText('Phone');
    await expect(caseRecord.field('Type')).toContainText('Electrical');

    const saved = await api.casesWithSubject(subject);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      CaseNumber: caseNumber,
      Status: 'New',
      Priority: 'High',
      Origin: 'Phone',
      Type: 'Electrical',
    });
  });

  test('does not save a case without a Case Origin', async ({ caseForm, subject, api }) => {
    await caseForm.open();
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');

    await caseForm.fill({ subject });
    await caseForm.save();

    // Business rule 1: Salesforce shows "We hit a snag." and names the field.
    await expect(caseForm.errorDialog).toBeVisible();
    await expect(caseForm.errorFieldLink('Case Origin')).toBeVisible();

    await caseForm.closeErrorDialog();
    await expect(caseForm.heading).toBeVisible();
    await expect(caseForm.subject).toHaveValue(subject);
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');

    expect(await api.casesWithSubject(subject)).toHaveLength(0);
  });

  test('escalates a case from its record page', async ({ caseRecord, subject, api }) => {
    const caseId = await api.createCase({ Subject: subject, Origin: 'Web' });

    await caseRecord.open(caseId);
    await expect(caseRecord.heading(subject)).toBeVisible();
    await expect(caseRecord.field('Status')).toContainText('New');

    await caseRecord.changePicklist('Status', 'Escalated');
    await expect(caseRecord.field('Status')).toContainText('Escalated');

    // Business rule 4: escalation is recorded in the case feed as a status change.
    await caseRecord.openFeed();
    await expect(caseRecord.statusChangeInFeed('New', 'Escalated')).toBeVisible();

    const [saved] = await api.casesWithSubject(subject);
    expect(saved).toMatchObject({ Id: caseId, Status: 'Escalated', Origin: 'Web', Priority: 'Medium' });
  });
});
