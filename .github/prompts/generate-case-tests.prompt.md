---
description: Generate the Case demo tests using the planner, generator and healer with our Skills
---

Generate the Playwright tests for the three demo scenarios of the Salesforce Case flow.

## Scenarios

1. Create a case with its key details
2. Do not save a case without a Case Origin
3. Escalate a case from its record page

## How to work

Do the steps in order and say which step you are on as you go.

1. **Business context.** Read the `case-domain` skill. The expected results in the
   plan must come from its business rules, not only from what is visible on the page.

2. **Plan (planner).** With the Playwright test tools, set up the page from
   `tests/seed.spec.ts` (`planner_setup_page`), open the New Case form and read its
   snapshot. Then save a plan for exactly the three scenarios above to
   `specs/case-lifecycle-plan.md` (`planner_save_plan`): numbered steps, and the
   expected results for each.

3. **Generate (generator).** Follow the `write-salesforce-test` skill. Write the three
   tests in one file, `tests/case-lifecycle.spec.ts`:
   - import `test` and `expect` from `./fixtures` and use its fixtures
     (`caseForm`, `caseRecord`, `subject`, `api`);
   - reuse the page objects in `tests/pages/`; add to them only if something is missing;
   - check every save twice, on the screen and through `api`;
   - for scenario 3, create the case through `api` first, then escalate it in the UI.

4. **Prove (healer).** Run `npx playwright test tests/case-lifecycle.spec.ts`. If a test
   fails, look at the page, decide whether the test or Salesforce is wrong, and fix the
   test without weakening what it checks. Then run `npm run check` and fix anything it reports.

5. **Summarise** in five lines or fewer: files written, scenarios covered, test
   results, and anything a person should review.

## Rules

- Do not change `tests/auth.setup.ts`, `tests/support/`, `tests/fixtures.ts`,
  `playwright.config.ts` or anything in `.auth/`.
- Do not sign in yourself; the test setup already does.
- Only create cases whose Subject starts with "PW Demo", and leave none behind.
