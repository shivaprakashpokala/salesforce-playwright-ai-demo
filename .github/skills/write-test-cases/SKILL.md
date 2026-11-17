---
name: write-test-cases
description: Write manual test cases from a user story or requirement in this team's template. Use whenever asked to create, review or extend test cases, test scenarios or a test checklist.
---

# Writing test cases in this team

## 1. Read the story first
- Number the acceptance criteria if they are not numbered. Every criterion needs
  at least one test case, and every test case names the criterion it covers.
- If a criterion is unclear or two conflict, list it under "Questions for the BA"
  instead of guessing.

## 2. What to cover
- The happy path, once.
- One negative case for every rule that can be broken.
- Boundary cases for anything with a limit (lengths, dates, amounts, formats):
  on the limit and one step either side.
- Any behaviour that only appears in some situations (defaults, conditional
  messages, confirmations).

## 3. Our template
Copy the layout in `template.md` in this folder. `example.md` shows one test case
written the way we want. Output one Markdown table with exactly these columns:

| ID | Covers | Title | Preconditions | Steps | Expected result | Priority |

- ID: `TC-<feature>-<number>`, for example `TC-CASE-001`.
- Covers: the acceptance criterion it tests, for example `AC1`.
- Title: starts with a verb and states the behaviour (`Reject a case with no Case Origin`).
- Steps: numbered, one action each, with the exact test data to enter.
- Expected result: what the user sees, including the exact message text if known.
- Priority: High = stops the user finishing their task; Medium = wrong but there
  is a workaround; Low = cosmetic.
- Order the rows by priority, High first.

## 4. Finish with
- "Coverage": one line per acceptance criterion listing the test case IDs that cover it.
- "Not covered": anything you deliberately left out, and why.
- "Questions for the BA": anything the story does not answer.
