---
name: write-test-cases
description: Write manual test cases from a user story or requirement in this team's template. Use whenever asked to create, review or extend test cases, test scenarios or a test checklist.
---

# Writing test cases in this team

## 1. Read the story first
- List every rule in the acceptance criteria. Each rule needs at least one test case.
- If a rule is unclear or two rules conflict, list it under "Questions for the BA"
  instead of guessing.

## 2. What to cover
- The happy path, once.
- One negative case for every validation rule.
- Boundary cases for anything with a limit (lengths, dates, amounts): on the limit
  and one step either side.
- Any behaviour that only appears in some situations (conditional messages, hidden fields).

## 3. Our template
Copy the layout in `template.md` in this folder. `example.md` shows one test case
written the way we want. Output one Markdown table with exactly these columns:

| ID | Title | Preconditions | Steps | Expected result | Priority |

- ID: `TC-<feature>-<number>`, for example `TC-INC-001`.
- Title: starts with a verb and states the behaviour (`Reject a future incident date`).
- Steps: numbered, one action each, with the exact test data to enter.
- Expected result: what the user sees, including the exact message text if known.
- Priority: High = blocks the user from finishing; Medium = wrong but there is a
  workaround; Low = cosmetic.

## 4. Finish with
- "Not covered": anything you deliberately left out, and why.
- "Questions for the BA": anything the story does not answer.
