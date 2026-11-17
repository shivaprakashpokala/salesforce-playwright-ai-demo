# Salesforce + Playwright + AI: Case lifecycle tests

Playwright end-to-end tests for the **Case** flow in a Salesforce Lightning org,
built with the three things from the lunch & learn:

| Building block | Where it is in this repo | What it did here |
| --- | --- | --- |
| **Playwright MCP server** | `.vscode/mcp.json`, `.mcp.json` | Opened the org in a real browser and read each page as a snapshot of labels and roles |
| **Skills** | `.github/skills/` (copied to `.claude/skills/`) | `case-domain` holds the business context; `write-salesforce-test` holds how we write tests |
| **Playwright agents** | `.github/agents/`, `.claude/agents/` | Planner wrote `specs/case-lifecycle-plan.md`; generator wrote `tests/generated/`; healer's `test_run` ran the suite |

## What is tested

| Test | Business rule (from `case-domain`) |
| --- | --- |
| creates a case with its key details | A saved case keeps what the agent entered and gets a Case Number |
| does not save a case without a Case Origin | We must always know how the customer contacted us |
| does not save a case when the form is cancelled | Cancelling leaves nothing behind |
| new case defaults to Status New and Priority Medium | Defaults for a new case |
| escalates a case from its record page | Escalation is done on the record page |
| deletes a case | Deleting asks for confirmation first |

Every save is checked twice: on the screen, and through the Salesforce API.
Every test creates its own case (subject starts with "PW Demo") and deletes it afterwards.

## Repository map

```
specs/case-lifecycle-plan.md        the planner's test plan, in plain English
tests/case-lifecycle.spec.ts        the main suite
tests/generated/                    a test written by the generator from the plan
tests/pages/                        page objects: New Case form, Case record page
tests/support/lightning.ts          reliable picklist helper for Lightning
tests/support/salesforce-api.ts     checks saved data and cleans up
tests/auth.setup.ts                 signs in once and saves the session
tests/seed.spec.ts                  starting point for the agents
.github/skills/                     Skills: case-domain, write-salesforce-test, write-test-cases, write-bug-report
.github/agents/                     Playwright planner, generator and healer
.github/workflows/playwright.yml    GitHub Actions workflow
DEMO-SCRIPT.md                      run sheet for a live demo
```

## Setup

Needs Node.js 20+.

```bash
npm install
```

```bash
npx playwright install chromium
```

Copy `.env.example` to `.env` and fill in your org's login URL, username and password.
`.env` and the saved session in `.auth/` are git-ignored. Never commit them.

## Run

```bash
npm test
```

```bash
npm run report
```

```bash
npm run check
```

`npm run check` runs the conventions script from the `write-salesforce-test` skill.

### If Salesforce asks for a verification code

Salesforce emails a code the first time it sees a new browser. Sign in once by hand
and let Playwright save the session:

```bash
npx playwright codegen --save-storage=.auth/state.json https://your-domain.develop.my.salesforce.com
```

Log in, enter the code, close the browser. The tests reuse that session from then on.

## GitHub Actions

The workflow runs on demand (Actions tab, **Run workflow**). It needs repository
secrets `SF_LOGIN_URL`, `SF_USERNAME` and `SF_PASSWORD`. A fresh GitHub runner is a
machine Salesforce has not seen before, so it will ask for a verification code unless
you either add the optional `SF_STORAGE_STATE` secret (the base64 of your
`.auth/state.json`) or relax Login IP Ranges on the user's profile in a throwaway org.

## How this was built

An AI assistant did the work an agent does, using the same tools the Playwright
agents use: it explored the org through the Playwright MCP server, saved the plan with
the planner's `planner_save_plan` tool, performed a scenario and wrote it with the
generator's `generator_write_test` tool, and ran and repaired the suite with the
healer's `test_run` tool. Three tests failed on the first run (Lightning picklists
closing while the form loaded, a message that does not appear after an inline edit, and
an error dialog hiding the form behind it). The fixes are now rules in the
`write-salesforce-test` skill so they are not rediscovered.
