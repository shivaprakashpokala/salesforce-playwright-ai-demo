# Demo run sheet: Salesforce Case flow (about 10 minutes)

Before you start: `.env` filled in, and one successful `npm test` on this machine so
the Salesforce session is saved. Open VS Code on this folder with the AI chat in agent
mode (or Claude Code in a terminal here).

**Fallback:** everything below has already been done once and saved in this repo: the
plan in `specs/`, the generated test in `tests/generated/`, the suite in `tests/`.
If a live step stalls, show the saved file.

## Step 1 - Playwright MCP server: see the page (2 min)

Show `.vscode/mcp.json`. Then ask:

> Open the Cases list in Salesforce, select New, and tell me what fields are on the
> New Case form, grouped by section.

Point out: the browser opens by itself, already signed in; the answer lists the four
sections and their fields, read from the page snapshot.

## Step 2 - Skills: the business context (1 min)

Open `.github/skills/case-domain/SKILL.md`. One page of plain English: what a case is,
the rules, what matters most. Then `.github/skills/write-salesforce-test/SKILL.md`: how
we write Salesforce tests, including the three lessons the first run taught us.

## Step 3 - Planner: write the plan (2 min)

Pick the **playwright-test-planner** agent:

> Plan tests for creating and working a Case. Use the case-domain skill for the
> business rules. Save the plan in specs/.

Compare with `specs/case-lifecycle-plan.md`. Point at "Do not save a case without a
Case Origin": that rule came from the business context.

## Step 4 - Generator: write a test (2 min)

Pick the **playwright-test-generator** agent:

> Generate the test "New case defaults to Status New and Priority Medium" from
> specs/case-lifecycle-plan.md. Follow the write-salesforce-test skill.

Compare with `tests/generated/new-case-defaults.spec.ts`. Each plan step is a comment.

## Step 5 - Run the suite (2 min)

```bash
npm test
```

```bash
npm run report
```

Eight tests, about 40 seconds. Open the report and one trace.

## Step 6 - Healer: fix a break (optional, 2 min)

In `tests/pages/case-form.page.ts`, change `'Save'` to `'Submit'` in `saveButton` to
simulate a renamed button, run `npm test`, then pick the **playwright-test-healer** agent:

> Run the tests and fix the failures.

Point out: it finds the real button name on the page and repairs the page object.
