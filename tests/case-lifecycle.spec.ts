import { test, expect } from './fixtures';

// Generated from specs/case-lifecycle-plan.md (user story: docs/case-user-story.md).
// Expected results follow the business rules in the case-domain skill.
test.describe('Case lifecycle', () => {
  test('Create a case with its key details', async ({ page, caseForm, caseRecord, subject, api }) => {
    const description = 'Customer reports the backup generator will not start after the last power cut.';

    await caseForm.open();
    // Business rule 2: a new case starts as New / Medium; Case Origin has no default.
    await expect(caseForm.picklist('Status')).toContainText('New');
    await expect(caseForm.picklist('Priority')).toContainText('Medium');
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');

    await caseForm.fill({ subject, description, priority: 'High', caseOrigin: 'Phone', type: 'Electrical' });
    await expect(caseForm.picklist('Status')).toContainText('New');
    await caseForm.save();

    // On the screen: confirmation with an eight-digit Case Number (acceptance criterion 3).
    await expect(caseRecord.createdMessage).toBeVisible();
    const confirmation = (await caseRecord.createdMessage.textContent()) ?? '';
    const caseNumber = confirmation.match(/Case "(\d+)" was created\./)?.[1];
    expect(caseNumber).toMatch(/^\d{8}$/);

    await expect(caseRecord.heading(subject)).toBeVisible();
    await expect(caseRecord.field('Status')).toContainText('New');
    await expect(caseRecord.field('Priority')).toContainText('High');
    await expect(caseRecord.field('Case Origin')).toContainText('Phone');
    await expect(caseRecord.field('Type')).toContainText('Electrical');

    // Through the API: exactly this case, saved with these values.
    const saved = await api.casesWithSubject(subject);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      CaseNumber: caseNumber,
      Status: 'New',
      Priority: 'High',
      Origin: 'Phone',
      Type: 'Electrical',
    });
    // Lightning opens a new record at /lightning/r/<Id>/view or /lightning/r/Case/<Id>/view.
    await expect(page).toHaveURL(new RegExp(`/lightning/r/(Case/)?${saved[0].Id}/view`));
  });

  test('Do not save a case without a Case Origin', async ({ caseForm, caseRecord, subject, api }) => {
    await caseForm.open();
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');

    await caseForm.fill({ subject, description: 'Customer says the generator cuts out under load.' });
    await caseForm.save();

    // Business rule 1: "We hit a snag." naming Case Origin.
    await expect(caseForm.errorDialog).toBeVisible();
    await expect(caseForm.errorFieldLink('Case Origin')).toBeVisible();

    await caseForm.closeErrorDialog();
    await expect(caseForm.heading).toBeVisible();
    await expect(caseForm.subject).toHaveValue(subject);
    await expect(caseForm.picklist('Case Origin')).toContainText('--None--');
    await expect(caseRecord.createdMessage).toBeHidden();

    expect(await api.casesWithSubject(subject)).toHaveLength(0);
  });

  test('Escalate a case from its record page', async ({ caseRecord, subject, api }) => {
    // Setup through the API: the case itself is not the point of this test.
    const caseId = await api.createCase({ Subject: subject, Origin: 'Email' });
    const [created] = await api.casesWithSubject(subject);
    expect(created).toMatchObject({ Id: caseId, Status: 'New' });

    await caseRecord.open(caseId);
    await expect(caseRecord.heading(subject)).toBeVisible();
    await expect(caseRecord.field('Status')).toContainText('New');

    await caseRecord.changePicklist('Status', 'Escalated');
    await expect(caseRecord.field('Status')).toContainText('Escalated');

    // Business rule 4: escalation is recorded in the feed as a status change.
    await caseRecord.openFeed();
    await expect(caseRecord.statusChangeInFeed('New', 'Escalated')).toBeVisible();

    const [escalated] = await api.casesWithSubject(subject);
    expect(escalated).toMatchObject({ Id: caseId, Status: 'Escalated', Origin: 'Email', Subject: subject });
  });
});
