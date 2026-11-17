<!-- Request: "Write test cases for this user story." + docs/case-user-story.md, with no Skill. Output shown exactly as returned. -->

# Test cases: Log a customer problem as a case

**Common preconditions (all test cases):** The tester is logged in as a support agent with create, edit and delete access to cases, and starts on the Cases list.

**Assumptions:**
- Case Origin is the only field the story makes mandatory; any other mandatory fields are filled with valid data.
- The exact wording of the confirmation and error messages is not specified, so the cases check that a message appears and what it refers to.

## Summary

| ID | Title | Criterion | Type |
|---|---|---|---|
| TC-01 | Save is blocked when Case Origin is empty | 1 | Negative |
| TC-02 | Case saves with each Case Origin value | 1, 3 | Positive |
| TC-03 | Case Origin offers only Phone, Email and Web | 1 | Positive |
| TC-04 | New case defaults to Status New and Priority Medium | 2 | Positive |
| TC-05 | Agent can change Status and Priority before saving | 2 | Positive |
| TC-06 | Saving shows a confirmation and an eight-digit Case Number | 3 | Positive |
| TC-07 | Each case gets a unique Case Number | 3 | Positive |
| TC-08 | Cancelling a filled-in form creates nothing | 4 | Negative |
| TC-09 | Cancelling after a failed save creates nothing | 1, 4 | Negative |
| TC-10 | Agent escalates a case from the record page | 5 | Positive |
| TC-11 | Escalated status persists and the Case Number is unchanged | 5 | Positive |
| TC-12 | Delete asks for confirmation, and confirming deletes the case | 6 | Positive |
| TC-13 | Cancelling the delete confirmation keeps the case | 6 | Negative |

## Criterion 1: Case Origin is required

### TC-01: Save is blocked when Case Origin is empty
**Priority:** High

| # | Step | Expected result |
|---|---|---|
| 1 | Click **New**. | The New Case form opens. |
| 2 | Leave Case Origin empty and fill in Subject with "Printer not working". | Case Origin shows no value. |
| 3 | Click **Save**. | The form stays open, an error identifies Case Origin as required, and no confirmation appears. |
| 4 | Close the form and search the Cases list for "Printer not working". | No such case exists. |

### TC-02: Case saves with each Case Origin value
**Priority:** High
**Test data:** Run once each for Phone, Email and Web.

| # | Step | Expected result |
|---|---|---|
| 1 | Click **New**. | The New Case form opens. |
| 2 | Select the Case Origin under test. | The value is shown in the field. |
| 3 | Click **Save**. | The case is saved and a confirmation appears. |
| 4 | Open the saved case. | Case Origin shows the selected value. |

### TC-03: Case Origin offers only Phone, Email and Web
**Priority:** Medium

| # | Step | Expected result |
|---|---|---|
| 1 | Click **New**. | The New Case form opens. |
| 2 | Open the Case Origin picklist. | The options are Phone, Email and Web, plus at most an empty "none" option. No other values are offered. |

## Criterion 2: Default Status and Priority

### TC-04: New case defaults to Status New and Priority Medium
**Priority:** High

| # | Step | Expected result |
|---|---|---|
| 1 | Click **New**. | The form opens with Status = New and Priority = Medium preselected. |
| 2 | Select Case Origin = Phone, leaving Status and Priority untouched. | Status and Priority are unchanged. |
| 3 | Click **Save** and open the saved case. | The record shows Status = New and Priority = Medium. |

### TC-05: Agent can change Status and Priority before saving
**Priority:** Medium
**Test data:** Status = Working (or any non-default value available), Priority = High.

| # | Step | Expected result |
|---|---|---|
| 1 | Click **New** and select Case Origin = Email. | The form shows the defaults New and Medium. |
| 2 | Change Status to Working and Priority to High. | Both fields show the new values. |
| 3 | Click **Save** and open the saved case. | The record shows Status = Working and Priority = High, not the defaults. |

## Criterion 3: Confirmation and Case Number

### TC-06: Saving shows a confirmation and an eight-digit Case Number
**Priority:** High

| # | Step | Expected result |
|---|---|---|
| 1 | Click **New**, select Case Origin = Web and click **Save**. | A confirmation appears saying the case was created. |
| 2 | Open the saved case and read the Case Number. | The Case Number is exactly eight characters, all digits 0-9 (leading zeros allowed, e.g. 00001027). |
| 3 | Try to edit the Case Number. | The field is read-only, because the number is system-assigned. |

### TC-07: Each case gets a unique Case Number
**Priority:** Medium

| # | Step | Expected result |
|---|---|---|
| 1 | Create a case with Case Origin = Phone and note its Case Number. | An eight-digit number is assigned. |
| 2 | Create a second case with Case Origin = Phone and note its Case Number. | An eight-digit number is assigned, and it differs from the first. |

## Criterion 4: Cancel creates nothing

### TC-08: Cancelling a filled-in form creates nothing
**Priority:** High
**Test data:** Subject = "Cancel test" plus the current timestamp, so it is unique.

| # | Step | Expected result |
|---|---|---|
| 1 | Note the number of cases in the "All Cases" list view. | The count is recorded. |
| 2 | Click **New**, select Case Origin = Phone and enter the unique Subject. | The form is filled in. |
| 3 | Click **Cancel**. | The form closes and no confirmation appears. |
| 4 | Refresh the list and search for the unique Subject. | No case with that Subject exists, and the count matches step 1. |

### TC-09: Cancelling after a failed save creates nothing
**Priority:** Low
**Test data:** A unique Subject.

| # | Step | Expected result |
|---|---|---|
| 1 | Click **New**, enter the unique Subject, leave Case Origin empty and click **Save**. | The required-field error is shown. |
| 2 | Click **Cancel**. | The form closes. |
| 3 | Search for the unique Subject. | No case exists. |

## Criterion 5: Escalation

### TC-10: Agent escalates a case from the record page
**Priority:** High
**Preconditions:** A case exists with Status = New.

| # | Step | Expected result |
|---|---|---|
| 1 | Open the case's record page. | Status shows New. |
| 2 | Edit Status, select Escalated and save. | The change saves without error. |
| 3 | Read Status on the record page. | Status shows Escalated. |

### TC-11: Escalated status persists and the Case Number is unchanged
**Priority:** Medium
**Preconditions:** The case from TC-10, with its Case Number noted beforehand.

| # | Step | Expected result |
|---|---|---|
| 1 | Refresh the record page. | Status still shows Escalated. |
| 2 | Find the case in the Cases list. | The list shows Status = Escalated for the case. |
| 3 | Compare the Case Number, Case Origin and Priority with their values before escalation. | All three are unchanged. |

## Criterion 6: Delete confirmation

### TC-12: Delete asks for confirmation, and confirming deletes the case
**Priority:** High
**Preconditions:** A disposable case exists, with its Case Number noted.

| # | Step | Expected result |
|---|---|---|
| 1 | Open the case and choose **Delete**. | A confirmation dialog asks whether to delete the case. The case is not yet deleted. |
| 2 | Confirm the deletion. | The dialog closes and the agent leaves the record page. |
| 3 | Search the Cases list for the Case Number. | The case is no longer listed. |

### TC-13: Cancelling the delete confirmation keeps the case
**Priority:** High
**Preconditions:** A case exists, with its Case Number noted.

| # | Step | Expected result |
|---|---|---|
| 1 | Open the case and choose **Delete**. | The confirmation dialog appears. |
| 2 | Click **Cancel** in the dialog. | The dialog closes and the record page is still shown. |
| 3 | Refresh the page and search the Cases list for the Case Number. | The case still exists with all its field values unchanged. |

## Open questions for the product owner

1. What is the exact text of the save confirmation and the Case Origin error?
2. Can a case be escalated from any Status, including Closed?
3. Are deleted cases recoverable (e.g. from a recycle bin), and should that be tested?
4. Is the Case Number always zero-padded to eight digits, and what happens after 99999999?
5. Should closing the form with the X or the Escape key behave the same as Cancel?
