---
name: write-salesforce-test
description: Write or fix Playwright end-to-end tests for Salesforce Lightning the way this team writes them. Use whenever asked to create, extend, review or repair a UI test in this repository.
---

# Writing Playwright tests for Salesforce in this repo

Follow these steps in order. Do not skip the last one.

## 0. Make sure the framework is there
Our framework is a small kit: `playwright.config.ts`, the sign-in setup
(`tests/auth.setup.ts`), helpers in `tests/support/`, fixtures and page objects.
If `playwright.config.ts` or `tests/auth.setup.ts` is missing, put the kit back with

    node .github/skills/write-salesforce-test/scripts/scaffold.mjs

and prove sign-in works with `npx playwright test tests/seed.spec.ts`. Never write
these files from scratch, and never overwrite ones that exist.

## 1. Know the business first
- Read the domain skill for the object under test (for cases: `case-domain`).
  Test the rules in it, not just what is visible on the page.

## 2. Look before you write
- Open the page with the Playwright MCP browser tools and read the snapshot.
- Note the real labels, picklist values and messages. Never guess a locator.

## 3. One page object per screen
- Page objects live in `tests/pages/<name>.page.ts`. Start from `templates/page-object.ts`.
- Methods describe user intent (`fill`, `save`, `changePicklist`), not clicks.
- No assertions inside page objects. Assertions belong in the spec.

## 4. Salesforce rules
- Find elements by role and visible label: `getByRole('combobox', { name: 'Priority', exact: true })`.
  Use `exact: true`; many labels overlap ("Save" / "Save & New").
- Never use Lightning's generated ids or CSS classes. They change on every page load.
- Picklists: always use `choosePicklistOption` from `tests/support/lightning.ts`.
  Lightning re-renders while loading and can close a dropdown just after it opens.
- A field on a record page is found through its "Edit <label>" button (see `CaseRecordPage.field`).
- When an error dialog is open, the form behind it is hidden. Close the dialog before checking the form.
- A record page URL may or may not include the object name: after a save Lightning can open
  `/lightning/r/<Id>/view` instead of `/lightning/r/Case/<Id>/view`. Match the URL by record Id,
  with the object name optional (`/lightning/r/(Case/)?<Id>/view`).
- Never use fixed waits. Use web-first assertions; Salesforce is slow, the timeouts in
  `playwright.config.ts` already allow for it.

## 5. Test data
- Import `test` from `tests/fixtures.ts`. Use the `subject` fixture for a unique name;
  anything created with it is deleted after the test.
- Set up data that is not the point of the test through the `api` fixture (jsforce), not the UI.
- Never sign in inside a test. `tests/auth.setup.ts` signs in once with JWT and every test reuses it.
- After a save, check the result twice: on the screen and through `api`.
- Never rely on records that already exist in the org.

## 6. Prove it
- Run `npx playwright test <file>` and read the output.
- Run `npm run check` and fix everything it reports.
- If a test fails, work out whether the test or Salesforce is wrong before changing
  anything. Report suspected product bugs instead of weakening the assertion.
- Finish with a short summary: which behaviours are covered, which are not, and why.
