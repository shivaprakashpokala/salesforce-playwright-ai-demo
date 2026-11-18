# Case lifecycle test plan

## Application Overview

Salesforce Lightning Case object, from the user story in docs/case-user-story.md. A support agent logs a customer problem as a case. The New Case form has Status* (default New), Priority (default Medium), Case Origin* (Phone, Email, Web; default --None--), Type, Subject and Description. Expected results come from the case-domain business rules: a case cannot be saved without a Case Origin ("We hit a snag." naming the field); a new case starts as New / Medium unless changed; each saved case gets an eight-digit Case Number; escalation (Status = Escalated) is done from the record page and recorded in the case feed as a status change. Every test uses a Subject starting with "PW Demo" and deletes what it creates. Each save is checked on the screen and through the Salesforce API.

## Test Scenarios

### 1. Case lifecycle

**Seed:** `tests/seed.spec.ts`

#### 1.1. Create a case with its key details

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Open the New Case form from the Cases tab
    - expect: The "New Case" form is shown
    - expect: Status shows New and Priority shows Medium by default (business rule 2)
    - expect: Case Origin shows --None--
  2. Set Priority to High, Case Origin to Phone and Type to Electrical; enter a Subject starting with "PW Demo" and a realistic Description (a generator that will not start)
    - expect: Each picklist shows the chosen value
    - expect: Status still shows New
  3. Click Save
    - expect: A confirmation 'Case "<number>" was created.' appears and the number is eight digits (acceptance criterion 3)
    - expect: The record page heading shows the Subject
    - expect: The Details tab shows Status New, Priority High, Case Origin Phone, Type Electrical
  4. Look up the case by its Subject through the API
    - expect: Exactly one case exists with that Subject
    - expect: It has an eight-digit CaseNumber equal to the one in the confirmation
    - expect: Status New, Priority High, Origin Phone, Type Electrical were saved (a High priority case not saved as such is a High priority defect)

#### 1.2. Do not save a case without a Case Origin

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Open the New Case form
    - expect: Case Origin shows --None--
  2. Enter a Subject starting with "PW Demo" and a Description, leave Case Origin empty, and click Save
    - expect: A "We hit a snag." dialog appears (business rule 1)
    - expect: The dialog lists "Case Origin" as the field needing attention
  3. Close the error dialog
    - expect: The New Case form is still open with the Subject kept
    - expect: Case Origin still shows --None--
    - expect: No 'was created' confirmation is shown
  4. Look up cases with that Subject through the API
    - expect: No case exists with that Subject

#### 1.3. Escalate a case from its record page

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Create a case through the API with a "PW Demo" Subject, Origin Email (Status New, Priority Medium by default) - setup, not the point of the test
    - expect: The API returns the new case Id
    - expect: The API shows Status New
  2. Open the case record page
    - expect: The heading shows the Subject
    - expect: Status shows New on the Details tab
  3. Edit Status in place, choose Escalated and Save
    - expect: Status shows Escalated on the Details tab (business rule 4 / acceptance criterion 5)
  4. Open the Feed tab
    - expect: A "Case status updated" post shows the change from New to Escalated (business rule 4)
  5. Read the case through the API
    - expect: Status is Escalated (an Escalated case not saved as such is a High priority defect)
    - expect: Origin and Subject are unchanged
