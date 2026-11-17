# Case lifecycle test plan

## Application Overview

The Cases tab of a Salesforce Lightning org. A support agent creates a case from the New Case form (four sections: Case Information, Web Information, Additional Information, Description Information), then works it from the case record page. Business rules come from the case-domain skill: Case Origin is required, a new case defaults to Status New and Priority Medium, cancelling leaves nothing behind, escalation happens on the record page, and deleting asks for confirmation.

## Test Scenarios

### 1. Creating a case

**Seed:** `tests/seed.spec.ts`

#### 1.1. Create a case with its key details

**File:** `tests/generated/create-a-case-with-its-key-details.spec.ts`

**Steps:**
  1. Select New on the Cases list
    - expect: The New Case form opens
  2. Choose Phone in Case Origin
  3. Choose High in Priority
  4. Choose Electrical in Type
  5. Enter a unique subject starting with "PW Demo" in Subject
  6. Enter "Generator will not start after the scheduled service." in Description
  7. Select Save
    - expect: A message says the case was created
    - expect: The record page shows the subject as its heading
    - expect: Status is New, Priority is High, Case Origin is Phone, Type is Electrical
    - expect: The case has an eight-digit Case Number

#### 1.2. Do not save a case without a Case Origin

**File:** `tests/generated/do-not-save-a-case-without-a-case-origin.spec.ts`

**Steps:**
  1. Select New on the Cases list
    - expect: The New Case form opens
  2. Enter a unique subject in Subject and leave Case Origin as --None--
  3. Select Save
    - expect: A "We hit a snag." dialog appears
    - expect: The dialog names Case Origin as the field to review
    - expect: No case with that subject exists

#### 1.3. Do not save a case when the form is cancelled

**File:** `tests/generated/do-not-save-a-cancelled-case.spec.ts`

**Steps:**
  1. Select New on the Cases list
    - expect: The New Case form opens
  2. Choose Email in Case Origin and enter a unique subject
  3. Select Cancel
    - expect: The form closes
    - expect: No case with that subject exists

#### 1.4. New case defaults to Status New and Priority Medium

**File:** `tests/generated/new-case-defaults.spec.ts`

**Steps:**
  1. Select New on the Cases list
    - expect: Status shows New
    - expect: Priority shows Medium

### 2. Working a case

**Seed:** `tests/seed.spec.ts`

#### 2.1. Escalate a case from its record page

**File:** `tests/generated/escalate-a-case.spec.ts`

**Steps:**
  1. Open a case that has Status New and Priority High
    - expect: The record page shows the case subject as its heading
  2. Select Edit Status, choose Escalated and select Save
    - expect: Status shows Escalated on the Details tab
    - expect: The case feed records the status change from New to Escalated

#### 2.2. Delete a case

**File:** `tests/generated/delete-a-case.spec.ts`

**Steps:**
  1. Open an existing case
    - expect: The record page shows the case subject as its heading
  2. Select Delete
    - expect: A Delete Case dialog asks for confirmation
  3. Select Delete in the dialog
    - expect: A message says the case was deleted
    - expect: The case no longer exists
