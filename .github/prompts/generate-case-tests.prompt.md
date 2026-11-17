---
description: Put back the framework and generate the Case tests using our Skills, the Playwright MCP servers and the planner, generator and healer
---

Generate the Playwright tests for the Salesforce Case user story in `docs/case-user-story.md`.

## The three tests to write

1. Create a case with its key details (acceptance criterion 3)
2. Do not save a case without a Case Origin (acceptance criterion 1)
3. Escalate a case from its record page (acceptance criterion 5)

## How to work

Do the steps in order and say which step you are on as you go.

1. **Framework (Skill).** If `playwright.config.ts` or `tests/auth.setup.ts` is missing,
   follow the `write-salesforce-test` skill to put our framework kit back: run
   `node .github/skills/write-salesforce-test/scripts/scaffold.mjs`, then prove sign-in
   works with `npx playwright test tests/seed.spec.ts`. If they are there, skip this step.

2. **Business context (Skill).** Read the `case-domain` skill. The expected results in
   the plan must come from its business rules, not only from what is visible on the page.

3. **Plan (planner, Playwright MCP).** With the Playwright test tools, set up the page
   from `tests/seed.spec.ts` (`planner_setup_page`), open the New Case form and read its
   snapshot. Then save a plan for exactly the three tests above to
   `specs/case-lifecycle-plan.md` (`planner_save_plan`): numbered steps, and the
   expected results for each.

4. **Generate (generator, Skill).** Follow the `write-salesforce-test` skill. Write the
   three tests in one file, `tests/case-lifecycle.spec.ts`:
   - import `test` and `expect` from `./fixtures` and use its fixtures
     (`caseForm`, `caseRecord`, `subject`, `api`);
   - reuse the page objects in `tests/pages/`; add to them only if something is missing;
   - check every save twice, on the screen and through `api`;
   - for test 3, create the case through `api` first, then escalate it in the UI.

5. **Prove (healer, Playwright MCP).** Run `npx playwright test tests/case-lifecycle.spec.ts`.
   If a test fails, look at the page, decide whether the test or Salesforce is wrong, and
   fix the test without weakening what it checks. Then run `npm run check` and fix
   anything it reports.

6. **Summarise** in five lines or fewer: files written, tests covered, test results,
   and anything a person should review.

## Rules

- Once the framework is in place, do not change `tests/auth.setup.ts`, `tests/support/`,
  `tests/fixtures.ts`, `playwright.config.ts` or anything in `.auth/`.
- Do not sign in yourself; the test setup already does.
- Only create cases whose Subject starts with "PW Demo", and leave none behind.
