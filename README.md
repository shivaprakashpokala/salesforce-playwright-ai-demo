# Salesforce + Playwright + AI: Case lifecycle tests

Playwright end-to-end tests for the **Case** flow in a Salesforce Lightning org,
built with the three things from the lunch & learn:

| Building block | Where it is in this repo | What it did here |
| --- | --- | --- |
| **Playwright MCP server** | `.vscode/mcp.json`, `.mcp.json` | Opened the org in a real browser and read each page as a snapshot of labels and roles |
| **Skills** | `.github/skills/` (copied to `.claude/skills/`) | `case-domain` holds the business context; `write-salesforce-test` holds how we write tests and our framework kit |
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
docs/case-user-story.md             the user story and acceptance criteria
docs/skill-comparison/              the same request answered without and with a Skill
specs/case-lifecycle-plan.md        the planner's test plan, in plain English
tests/case-lifecycle.spec.ts        three tests (deleted and regenerated in the demo)
tests/case-more.spec.ts             two more tests
tests/generated/                    a test written with the generator's own tool
tests/pages/                        page objects: New Case form, Case record page
tests/support/                      sign-in (JWT), data checks, Lightning helper
tests/auth.setup.ts                 signs in once and saves the session
.github/skills/                     Skills: case-domain, write-salesforce-test, write-test-cases
.github/agents/                     Playwright planner, generator and healer
.github/prompts/                    the saved request that regenerates everything
.claude/                            the same Skills, agents and request for Claude Code
.github/workflows/playwright.yml    GitHub Actions workflow
scripts/demo.mjs                    demo:reset, demo:reset:all, demo:generate, demo:restore
DEMO-SCRIPT.md                      run sheet and a one-sentence tour of every file
```

## Setup

Needs Node.js 20+.

```bash
npm install
```

```bash
npx playwright install chromium
```

Copy `.env.example` to `.env` and fill it in (see "Signing in" below). `.env` and
everything in `.auth/` are git-ignored. Never commit them or the private key.

## Signing in

The tests sign in with the **OAuth 2.0 JWT bearer flow**, so there is no password,
no emailed verification code and no MFA prompt, on a laptop or in CI.

1. `tests/support/salesforce-auth.ts` signs a three-minute JWT with your private key.
2. [jsforce](https://jsforce.github.io/) swaps it for an access token and gives us an API connection.
3. The same connection asks Salesforce for a one-time **front door** link
   (`/services/oauth2/singleaccess`, falling back to `/secur/frontdoor.jsp?sid=`),
   and the browser opens that link already signed in.
4. The browser session is saved to `.auth/state.json` and the API session to
   `.auth/session.json`; every test reuses both.

What the Salesforce app needs (External Client App or Connected App):

- JWT bearer flow enabled, with the certificate that matches your private key uploaded.
- OAuth scopes **api** (Manage user data via APIs) and **web** (Manage user data via Web
  browsers). Without `web`, the API works but the front door link lands on the login page.
- The test user pre-authorised (profile or permission set added to the app).

In `.env`:

```
SF_LOGIN_URL=https://your-domain.develop.my.salesforce.com
SF_USERNAME=you@example.com
SF_CLIENT_ID=<consumer key>
SF_PRIVATE_KEY_PATH=.auth/server.key
```

Put the private key file at `.auth/server.key` (that folder is git-ignored). The
client secret is not used by this flow. For a sandbox add
`SF_JWT_AUDIENCE=https://test.salesforce.com`.

If `SF_CLIENT_ID` is not set, the setup falls back to username and password through
the login page, which Salesforce may stop with a verification code.

## Run

```bash
npm test
```

```bash
npm run report
```

The report opens in the browser. Every test is recorded, so each test's page in the
report has a video of the run to play back, plus a screenshot and trace if it failed.

```bash
npm run check
```

`npm run check` runs the conventions script from the `write-salesforce-test` skill.

## Live demo: delete and regenerate

| Command | What it does |
| --- | --- |
| `npm run demo:reset` | Deletes the plan and the three tests |
| `npm run demo:reset:all` | Deletes all the test code: framework, page objects, tests, plan and config |
| `/generate-case-tests` in your AI assistant | Puts the framework back from the Skill's kit, then the planner, generator and healer write the plan and tests |
| `npm run demo:restore` | Puts the committed versions back |

`DEMO-SCRIPT.md` has the full run sheet.

## GitHub Actions

The workflow runs on demand (Actions tab, **Run workflow**). It uses the same JWT
sign-in and needs four repository secrets: `SF_LOGIN_URL`, `SF_USERNAME`,
`SF_CLIENT_ID` and `SF_PRIVATE_KEY` (paste the whole key file as the secret value).

## How this was built

An AI assistant did the work an agent does, using the same tools the Playwright
agents use: it explored the org through the Playwright MCP server, saved the plan with
the planner's `planner_save_plan` tool, performed a scenario and wrote it with the
generator's `generator_write_test` tool, and ran and repaired the suite with the
healer's `test_run` tool. Three tests failed on the first run (Lightning picklists
closing while the form loaded, a message that does not appear after an inline edit, and
an error dialog hiding the form behind it). The fixes are now rules in the
`write-salesforce-test` skill so they are not rediscovered.
