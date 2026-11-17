---
name: write-test-cases
description: Write manual test cases from a user story or requirement in this team's template, covering positive, negative and exception cases. Use whenever asked to create, review or extend test cases, test scenarios or a test checklist.
---

# Writing test cases in this team

## 1. Read the story first
- Number the acceptance criteria if they are not numbered. Every test case names
  the criterion it covers.
- If a criterion is unclear or two conflict, list it under "Questions for the BA"
  instead of guessing.

## 2. Cover three kinds of case for every acceptance criterion
- **Positive**: the rule works when the feature is used as intended.
- **Negative**: the rule holds when the user breaks it (missing, wrong or
  out-of-range input).
- **Exception**: something unexpected happens around it. The user double-clicks
  Save, leaves the form another way (X, Esc, browser Back), the session expires,
  the connection drops, or two people change the same record.

If a kind does not apply to a criterion, say so under "Not covered" rather than
inventing a case. Add boundary cases for anything with a limit.

## 3. Our template
One Markdown table, with exactly these columns. `template.md` in this folder has
the layout and `example.md` shows one test case written the way we want.

| ID | Covers | Type | Title | Preconditions | Steps | Expected result | Priority |

- ID: `TC-<feature>-<number>`, for example `TC-CASE-001`.
- Covers: the acceptance criterion it tests, for example `AC1`.
- Type: `Positive`, `Negative` or `Exception`.
- Title: starts with a verb and states the behaviour (`Reject a case with no Case Origin`).
- Steps: numbered, one action each, with the exact test data to enter.
- Expected result: what the user sees, including the exact message text if known.
- Priority: High = stops the user finishing their task; Medium = wrong but there
  is a workaround; Low = cosmetic.
- Order the rows by priority, High first.

## 4. Finish with
- "Coverage": one line per acceptance criterion, listing its test case IDs.
- "Not covered": anything you deliberately left out, and why.
- "Questions for the BA": anything the story does not answer.
