# Case lifecycle test plan

## Application Overview

Salesforce Lightning Case object, from the user story in docs/case-user-story.md. A support agent logs a customer's problem as a case. Expected results come from the case-domain business rules: Case Origin is required (Phone, Email, Web); a new case starts as Status New / Priority Medium unless changed; a saved case shows a confirmation and gets an eight-digit Case Number; escalation (Status = Escalated) is done from the record page and is recorded in the case feed as a status change. Every case created has a Subject starting with "PW Demo" and is deleted after the test. Every save is checked on screen and through the Salesforce API.

## Test Scenarios

### 1. Case lifecycle

**Seed:** `tests/seed.spec.ts`

#### 1.1. creates a case with its key details

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Open the New Case form
    - expect: The "New Case" form is shown
    - expect: Status shows New and Priority shows Medium (business rule 2)
    - expect: Case Origin shows --None--
  2. Enter a Subject starting with "PW Demo", choose Case Origin Phone, Priority High, Type Electrical, and enter a realistic Description (a generator that will not start). Leave Status unchanged.
    - expect: Each picklist shows the chosen value
  3. Click Save
    - expect: The confirmation 'Case "<number>" was created.' appears and the number is eight digits (AC 3)
    - expect: The record page heading shows the Subject
    - expect: The Details tab shows Status New, Priority High, Case Origin Phone, Type Electrical
  4. Query the case by Subject through the API
    - expect: Exactly one case exists
    - expect: Its CaseNumber is eight digits and matches the confirmation
    - expect: Status New, Priority High, Origin Phone, Type Electrical

#### 1.2. does not save a case without a Case Origin

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Open the New Case form
    - expect: The "New Case" form is shown with Case Origin --None--
  2. Enter a Subject starting with "PW Demo" and leave Case Origin as --None--
    - expect: Subject holds the entered text
  3. Click Save
    - expect: The "We hit a snag." error dialog appears (business rule 1)
    - expect: The dialog names the Case Origin field
  4. Close the error dialog
    - expect: The New Case form is still open with the Subject kept
    - expect: Case Origin is still --None--
  5. Query cases by Subject through the API
    - expect: No case was saved

#### 1.3. escalates a case from its record page

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Create a case through the API with a "PW Demo" Subject and Origin Web (setup, not the point of the test)
    - expect: The case exists with Status New
  2. Open the case record page
    - expect: The heading shows the Subject
    - expect: The Status field shows New
  3. Edit Status in place on the Details tab, choose Escalated and Save
    - expect: The Status field shows Escalated
  4. Open the Feed tab
    - expect: A "Case status updated" post shows New to Escalated (business rule 4)
  5. Query the case through the API
    - expect: Status is Escalated
    - expect: Origin is still Web and Priority still Medium
