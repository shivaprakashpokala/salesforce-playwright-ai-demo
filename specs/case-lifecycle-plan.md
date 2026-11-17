# Salesforce Case lifecycle – demo scenarios

## Application Overview

Support agents create a Case for each customer problem and work it to resolution. The New Case form (Cases tab → New) has Status* (default New), Priority (default Medium), Case Origin* (Phone/Email/Web), Type, Subject and Description, among others. Business rules under test (case-domain skill): (1) a case cannot be saved without a Case Origin – Salesforce shows "We hit a snag." and names the field; (2) a new case starts as Status New and Priority Medium unless the agent says otherwise; (4) escalating (Status = Escalated) is done from the record page and is recorded in the case feed as a status change. Every test case has a Subject starting with "PW Demo" and is deleted after the test. Each save is verified on screen and through the Salesforce API.

## Test Scenarios

### 1. Case lifecycle

**Seed:** `tests/seed.spec.ts`

#### 1.1. creates a case with its key details

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Open the New Case form from the Cases tab
    - expect: The "New Case" dialog is shown
    - expect: Status shows "New" and Priority shows "Medium" (rule 2 defaults)
    - expect: Case Origin shows "--None--"
  2. Set Case Origin to "Phone", Priority to "High", Type to "Electrical"; enter a "PW Demo …" Subject and a realistic Description (a standby generator that will not start); leave Status as New
    - expect: Each picklist shows the chosen value
  3. Click "Save"
    - expect: A toast reads 'Case "<8-digit number>" was created.'
    - expect: The record page heading is the Subject
    - expect: Details show Status New, Priority High, Case Origin Phone, Type Electrical
  4. Query the case by Subject through the API
    - expect: Exactly one case exists with that Subject
    - expect: Status = New, Priority = High, Origin = Phone, Type = Electrical
    - expect: CaseNumber is eight digits and matches the number in the toast

#### 1.2. does not save a case without a Case Origin

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Open the New Case form
    - expect: The "New Case" dialog is shown and Case Origin shows "--None--"
  2. Enter a "PW Demo …" Subject and a Description; leave Case Origin as --None--
    - expect: Subject is filled in
  3. Click "Save"
    - expect: The "We hit a snag." error dialog is shown (rule 1)
    - expect: The dialog names the "Case Origin" field as needing attention
    - expect: No created toast appears
  4. Close the error dialog
    - expect: The New Case form is still open with the entered Subject kept, so the agent loses no work
  5. Query the case by Subject through the API
    - expect: No case exists with that Subject

#### 1.3. escalates a case from its record page

**File:** `tests/case-lifecycle.spec.ts`

**Steps:**
  1. Create a case through the API with a "PW Demo …" Subject, Origin "Phone" (Status New, Priority Medium by default)
    - expect: The API returns the case Id; the case is Status New
  2. Open the case record page
    - expect: The heading is the Subject
    - expect: Details show Status "New"
  3. Edit Status in place on the Details tab, choose "Escalated" and Save
    - expect: Details show Status "Escalated"
  4. Check the case feed
    - expect: The feed records the status change from New to Escalated (rule 4)
  5. Query the case by Subject through the API
    - expect: Status = Escalated
    - expect: Priority and Origin are unchanged (Medium, Phone)
