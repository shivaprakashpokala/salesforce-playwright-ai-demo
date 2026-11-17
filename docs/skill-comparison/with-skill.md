<!-- Request: "Write test cases for this user story." + docs/case-user-story.md, with the write-test-cases Skill available. Output shown exactly as returned. -->

| ID | Covers | Title | Preconditions | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| TC-CASE-001 | AC1, AC2, AC3 | Save a case with a Case Origin and the default Status and Priority | Agent is logged in and on the Cases list | 1. Select New 2. Set Case Origin to "Phone" 3. Enter Subject "TC-CASE-001 printer will not power on" 4. Leave Status and Priority unchanged 5. Select Save | A confirmation that the case was created is shown. The case record shows a Case Number of exactly eight digits, Status "New", Priority "Medium" and Case Origin "Phone" | High |
| TC-CASE-002 | AC1 | Reject a case with no Case Origin | Agent is logged in and on the Cases list | 1. Select New 2. Leave Case Origin empty 3. Enter Subject "TC-CASE-002 no origin" 4. Select Save | The case is not saved and the form stays open. An error on the Case Origin field says it is required. No save confirmation is shown, and no case with Subject "TC-CASE-002 no origin" appears in the Cases list | High |
| TC-CASE-003 | AC4 | Cancel the new case form without creating a case | Agent is logged in and on the Cases list | 1. Select New 2. Set Case Origin to "Email" 3. Enter Subject "TC-CASE-003 cancelled" 4. Select Cancel 5. Search the Cases list for "TC-CASE-003 cancelled" | The form closes with no save confirmation. The search returns no case | High |
| TC-CASE-004 | AC5 | Escalate a case from its record page | A case exists with Status "New"; agent has its record page open | 1. Select Edit 2. Change Status to "Escalated" 3. Select Save 4. Refresh the page | The record page shows Status "Escalated" after saving and still shows it after the refresh. The Case Number is unchanged | High |
| TC-CASE-005 | AC6 | Ask for confirmation before deleting a case | A case with Subject "TC-CASE-005 delete me" exists; agent has its record page open | 1. Select Delete 2. In the confirmation dialog, select Delete 3. Search the Cases list for "TC-CASE-005 delete me" | After step 1 a dialog asks the agent to confirm the deletion and the case is not yet deleted. After step 2 the case is deleted and the search returns no case | High |
| TC-CASE-006 | AC6 | Keep the case when the delete confirmation is cancelled | A case with Subject "TC-CASE-006 keep me" exists; agent has its record page open | 1. Select Delete 2. In the confirmation dialog, select Cancel 3. Search the Cases list for "TC-CASE-006 keep me" | The dialog closes and the record page is still shown. The search returns the case with all its values unchanged | High |
| TC-CASE-007 | AC1 | Save a case with Case Origin Email | Agent is logged in and on the Cases list | 1. Select New 2. Set Case Origin to "Email" 3. Enter Subject "TC-CASE-007 origin email" 4. Select Save | A confirmation is shown and the case record shows Case Origin "Email" | Medium |
| TC-CASE-008 | AC1 | Save a case with Case Origin Web | Agent is logged in and on the Cases list | 1. Select New 2. Set Case Origin to "Web" 3. Enter Subject "TC-CASE-008 origin web" 4. Select Save | A confirmation is shown and the case record shows Case Origin "Web" | Medium |
| TC-CASE-009 | AC1 | Offer only Phone, Email and Web as Case Origin | Agent is logged in and on the Cases list | 1. Select New 2. Open the Case Origin list | The list offers exactly "Phone", "Email" and "Web" (plus an empty choice), and no value is preselected | Medium |
| TC-CASE-010 | AC2 | Show Status New and Priority Medium when the form opens | Agent is logged in and on the Cases list | 1. Select New 2. Read the Status and Priority fields without changing anything | Status shows "New" and Priority shows "Medium" | Medium |
| TC-CASE-011 | AC2 | Keep the Status and Priority the agent chose | Agent is logged in and on the Cases list | 1. Select New 2. Set Case Origin to "Phone" 3. Enter Subject "TC-CASE-011 changed defaults" 4. Change Status to "Escalated" 5. Change Priority to "High" 6. Select Save | A confirmation is shown. The case record shows Status "Escalated" and Priority "High", not the defaults | Medium |
| TC-CASE-012 | AC3 | Give each new case its own eight-digit Case Number | Agent is logged in and on the Cases list | 1. Select New 2. Set Case Origin to "Web" 3. Enter Subject "TC-CASE-012 first" 4. Select Save 5. Note the Case Number 6. Return to the Cases list and select New 7. Set Case Origin to "Web" 8. Enter Subject "TC-CASE-012 second" 9. Select Save | Both cases show a Case Number of exactly eight digits (leading zeros included), and the two numbers are different | Medium |
| TC-CASE-013 | AC1 | Save the case after adding the missing Case Origin | Agent is logged in and on the Cases list | 1. Select New 2. Leave Case Origin empty 3. Enter Subject "TC-CASE-013 corrected" 4. Select Save 5. Set Case Origin to "Phone" 6. Select Save | After step 4 the required-field error is shown and the Subject is still filled in. After step 6 a confirmation is shown and exactly one case with Subject "TC-CASE-013 corrected" exists | Medium |
| TC-CASE-014 | AC3 | Show the Case Number as read-only | A case exists; agent has its record page open | 1. Select Edit 2. Try to change the Case Number | The Case Number cannot be edited | Low |

## Coverage
- AC1: TC-CASE-001, TC-CASE-002, TC-CASE-007, TC-CASE-008, TC-CASE-009, TC-CASE-013
- AC2: TC-CASE-001, TC-CASE-010, TC-CASE-011
- AC3: TC-CASE-001, TC-CASE-012, TC-CASE-014
- AC4: TC-CASE-003
- AC5: TC-CASE-004
- AC6: TC-CASE-005, TC-CASE-006

## Not covered
- Exact wording of the save confirmation, the Case Origin error and the delete dialog: the story does not give the text, so the expected results describe the behaviour only. They need the exact messages added once the BA confirms them.
- Other ways of leaving the form (the X button, Esc, navigating away, Save & New): the story only names Cancel.
- Escalating by any route other than editing Status on the record page (list view inline edit, escalation rules): AC5 only names the record page.
- Changing Status to values other than Escalated, and closing or resolving a case: outside this story.
- Permissions (who may create, escalate or delete) and whether a deleted case can be restored: the story does not mention them.
- Cases created by email or web forms rather than by an agent: the story is about an agent recording the case.
- Performance, accessibility and mobile layout: not functional criteria of this story.

## Questions for the BA
- What is the exact text of the save confirmation, the missing Case Origin error and the delete confirmation dialog?
- Is Case Origin the only required field? The test cases enter a Subject only to identify the case afterwards; is Subject (or Contact or Account) expected on the form, and is any of them mandatory?
- AC1: is Case Origin empty when the form opens, or is a value preselected? TC-CASE-009 assumes it is empty.
- AC1: are Phone, Email and Web the complete list of origins, or just the ones valid for this story?
- AC2: which Status and Priority values can the agent pick when creating a case? TC-CASE-011 assumes "Escalated" and "High" are available on the new case form.
- AC3: is the Case Number always sequential and padded with leading zeros (for example 00001027), and is it read-only for agents?
- AC4: should Cancel warn about unsaved data, and should closing the form with X or Esc behave the same as Cancel?
- AC5: can a case be escalated from any Status, including a closed one? Should escalating trigger anything else (notification, owner change, an Escalated flag)?
- AC6: can every agent delete any case, or only their own? Does a deleted case go to a recycle bin, and is a message shown after the deletion?
