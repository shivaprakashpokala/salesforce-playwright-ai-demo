# Salesforce + Playwright + AI

Automated tests for a Salesforce user story, planned and written by AI agents and
reviewed by people. The project shows how three building blocks fit together:
**Skills**, the **Playwright MCP server** and the **Playwright agents**.

## Contents

**Part A: Overview**

1. [What this project does](#1-what-this-project-does)
2. [Who it is for](#2-who-it-is-for)
3. [The three building blocks](#3-the-three-building-blocks)
4. [How it works, in high-level steps](#4-how-it-works-in-high-level-steps)
5. [Where AI is used, and where people are](#5-where-ai-is-used-and-where-people-are)
6. [What is tested](#6-what-is-tested)

**Part B: Step-by-step guide**

7. [What to install](#7-what-to-install)
8. [Get a Salesforce Developer org](#8-get-a-salesforce-developer-org)
9. [Set up Salesforce for sign-in](#9-set-up-salesforce-for-sign-in)
10. [Set up the project](#10-set-up-the-project)
11. [Set up the AI assistant](#11-set-up-the-ai-assistant)
12. [Run the tests](#12-run-the-tests)
13. [View the report](#13-view-the-report)
14. [Add a new test case](#14-add-a-new-test-case)
15. [Add a new user story](#15-add-a-new-user-story)
16. [The delete-and-regenerate demo](#16-the-delete-and-regenerate-demo)
17. [Run in GitHub Actions](#17-run-in-github-actions)
18. [Troubleshooting](#18-troubleshooting)
19. [Repository map](#19-repository-map)
20. [Keeping secrets safe](#20-keeping-secrets-safe)

---

# Part A: Overview

## 1. What this project does

It takes one user story, "Log a customer problem as a case"
([`docs/case-user-story.md`](docs/case-user-story.md)), and turns it into running
Playwright tests against a real Salesforce org.

- **Signs in to Salesforce without a password prompt.** It uses a signed token (the
  JWT bearer flow), so there is no emailed verification code and it works on any
  machine, including a build server.
- **Writes a test plan in plain English** from the user story, the business rules and
  the real Salesforce page.
- **Writes Playwright tests from that plan**, in the team's style.
- **Runs the tests and repairs the ones that fail.**
- **Checks every result twice:** on the screen, and in Salesforce's data.
- **Cleans up after itself.** Every test creates its own case and deletes it.
- **Records a video of every test** in the HTML report.
- **Can be deleted and brought back.** One command removes the test code; one saved
  request has the AI put it back.

## 2. Who it is for

| You are | What you get from it | What you do |
| --- | --- | --- |
| **A manual tester or test lead** | Test cases in the team template in minutes, covering positive, negative and exception cases. A plain-English test plan you can review without reading code. | Write and maintain the business rules (a Skill is a text file). Review the plan. Decide whether the results are right. |
| **An automation engineer** | A first working version of the tests, already following the framework's conventions. Failing tests investigated and repaired. A sign-in that does not break on verification codes. | Own the framework and the Skill that describes it. Review generated code. Decide whether a failure is the test or the product. |

Nobody has to type test code to get a first version. Three jobs stay with people:
review the plan, check the result, and own the code.

## 3. The three building blocks

| Building block | What it is | Where it is in this repo | What it does here |
| --- | --- | --- | --- |
| **Skill** | A text file of written instructions the AI follows for one kind of job. No code needed to write one. | [`.github/skills/`](.github/skills/) | `case-domain` holds the business rules. `write-salesforce-test` holds how we write tests, and carries the framework as a kit. `write-test-cases` holds the manual test case template. |
| **Playwright MCP server** | A connector that gives the AI a real browser: open a page, click, type, read what is on screen. | [`.vscode/mcp.json`](.vscode/mcp.json), [`.mcp.json`](.mcp.json) | Lets the AI open the Salesforce New Case form and read its real labels, picklist values and buttons, instead of guessing them. |
| **Playwright agents** | Three ready-made agents that ship with Playwright. Each is a text file: a list of MCP actions plus instructions. | [`.github/agents/`](.github/agents/) | **Planner** writes the plan. **Generator** writes the tests. **Healer** runs them and repairs failures. |

In short: a Skill tells the AI **how** we do things, the MCP server lets it **do**
things, and the agents put the two to work.

## 4. How it works, in high-level steps

### Signing in to Salesforce

1. The test run signs a short-lived token with a private key that only we hold.
2. Salesforce checks the token against the certificate we uploaded, and returns an
   access token. No password is sent and no verification code is asked for.
3. The same access token gives us two things: an API connection (to check and clean
   up data) and a one-time "front door" link.
4. The browser opens the front door link and is signed in.
5. The session is saved once and reused by every test.

The code is in [`tests/support/salesforce-auth.ts`](tests/support/salesforce-auth.ts)
and [`tests/auth.setup.ts`](tests/auth.setup.ts).

### From user story to passing tests

1. **Read the business rules.** The AI reads the `case-domain` Skill. *(Skill)*
2. **Look at the real page.** It opens the New Case form in a browser and reads what
   is on it. *(Playwright MCP server)*
3. **Write the plan.** Steps come from the page, expected results come from the
   rules. Saved as [`specs/case-lifecycle-plan.md`](specs/case-lifecycle-plan.md).
   *(Planner agent)*
4. **A person reviews the plan.** This is the cheapest place to catch a mistake.
5. **Write the tests.** In our style, reusing our page objects.
   *(Generator agent + `write-salesforce-test` Skill)*
6. **Run and repair.** Run the tests, fix what fails, run the conventions check.
   *(Healer agent)*
7. **A person reviews the tests and the results.**

## 5. Where AI is used, and where people are

| Step | Done by | Checked by a person? |
| --- | --- | --- |
| Writing the user story and acceptance criteria | People | n/a |
| Writing the business rules (`case-domain` Skill) | People | n/a |
| Writing manual test cases from the story | AI, following the `write-test-cases` Skill | Yes |
| Exploring the Salesforce page | AI, through the Playwright MCP server | No need; it only reads |
| Writing the test plan | AI (planner agent) | **Yes, always** |
| Writing the Playwright tests | AI (generator agent) | Yes |
| Investigating and repairing failing tests | AI (healer agent) | Yes: was the test wrong, or the product? |
| The framework: sign-in, helpers, page objects, config | Written with an AI assistant, then reviewed and kept as a kit in the Skill | Yes, once; it is not rewritten each time |
| **Running** the tests | Playwright. No AI is involved at run time. | n/a |

Two things worth knowing:

- **A passing test is not always a correct test.** The AI can write a test that
  passes while leaving out something the plan asked for. Review against the plan.
- **When the AI gets something wrong, fix the Skill, not only the test.** Three rules
  in `write-salesforce-test` exist because the first run failed without them.

## 6. What is tested

| Test | Acceptance criterion | File |
| --- | --- | --- |
| Create a case with its key details | 3 | `tests/case-lifecycle.spec.ts` |
| Do not save a case without a Case Origin | 1 | `tests/case-lifecycle.spec.ts` |
| Escalate a case from its record page | 5 | `tests/case-lifecycle.spec.ts` |
| Does not save a case when the form is cancelled | 4 | `tests/case-more.spec.ts` |
| Deletes a case | 6 | `tests/case-more.spec.ts` |
| New case defaults to Status New and Priority Medium | 2 | `tests/generated/new-case-defaults.spec.ts` |

A run reports eight results: the six above, the sign-in, and a small starting-point
test (`tests/seed.spec.ts`) that the planner and generator agents begin from.

---

# Part B: Step-by-step guide

Follow sections 7 to 12 in order the first time. It takes about an hour, most of it
in Salesforce.

## 7. What to install

| Tool | Why | Notes |
| --- | --- | --- |
| [Node.js](https://nodejs.org) 20 or newer (LTS) | Runs Playwright and the scripts | Check with `node --version` |
| [Git](https://git-scm.com) | Gets the code | On Windows this also gives you Git Bash and OpenSSL |
| [Visual Studio Code](https://code.visualstudio.com) | Editor, and where the AI assistant runs | Any editor works for running tests only |
| OpenSSL | Makes the key and certificate for sign-in | Already on macOS and Linux. On Windows, use Git Bash |
| An AI coding assistant with **agent mode** that supports **MCP** | Only needed to generate or repair tests | For example GitHub Copilot in VS Code, or Claude Code |

You do **not** need an AI assistant to run the existing tests. You only need it to
plan, generate or heal.

Use only AI tools your organisation has approved, and never point one at real
customer or production data. This project is meant for a free Salesforce Developer
org with made-up data.

## 8. Get a Salesforce Developer org

1. Go to <https://developer.salesforce.com/signup> and sign up. It is free.
2. Open the verification email and set a password.
3. In Salesforce, go to **Setup** (the gear icon), search for **My Domain** and note
   your login address. It looks like
   `https://something-dev-ed.develop.my.salesforce.com`. This is your `SF_LOGIN_URL`.
4. Note your username (it looks like an email address). This is your `SF_USERNAME`.

## 9. Set up Salesforce for sign-in

The tests sign in with a key and certificate instead of a password. You set this up
once. Salesforce's menu names change a little between releases; if a label below is
not exactly what you see, look for the closest match.

### 9.1 Make a private key and a certificate

Run these two commands in a terminal (Git Bash on Windows), in any folder:

```bash
openssl genrsa -out server.key 2048
```

```bash
openssl req -new -x509 -key server.key -out server.crt -days 365 -subj "/CN=playwright-tests"
```

You now have two files:

- `server.key`: the **private key**. Keep it secret. It stays on your machine.
- `server.crt`: the **certificate** (the public half). This is uploaded to Salesforce.

### 9.2 Create an External Client App

1. In Salesforce **Setup**, search for **External Client App Manager** and open it.
2. Select **New External Client App**.
3. Give it a name (for example `Playwright Tests`) and a contact email.
4. Under API / OAuth settings, tick **Enable OAuth**.
5. **Callback URL:** enter `http://localhost:1717/OauthRedirect`. It is required by
   the form but not used by this flow.
6. **OAuth scopes:** add both of these.
   - **Manage user data via APIs (api)**
   - **Manage user data via Web browsers (web)**
7. Under flow enablement, tick **Enable JWT Bearer Flow** and upload `server.crt`.
8. Save (Create).

The `web` scope matters: without it the API works but the browser lands on the login
page instead of being signed in.

### 9.3 Pre-authorise your user

1. Open the app you just created and go to its **Policies**. Select **Edit**.
2. Under OAuth policies, set **Permitted Users** to
   **Admin approved users are pre-authorized**.
3. Add the profile or permission set of the user the tests run as (in a Developer
   org this is usually **System Administrator**).
4. Save.

### 9.4 Copy the consumer key

1. Open the app's **Settings**, find the OAuth settings and select
   **Consumer Key and Secret**. Salesforce may ask you to verify your identity.
2. Copy the **Consumer Key**. This is your `SF_CLIENT_ID`.

The consumer secret is not used by this flow. You do not need it.

Changes to an app can take a few minutes to take effect.

## 10. Set up the project

1. Get the code and open the folder:

   ```bash
   git clone https://github.com/shivaprakashpokala/salesforce-playwright-ai-demo.git
   ```

   ```bash
   cd salesforce-playwright-ai-demo
   ```

2. Install the dependencies and the browser:

   ```bash
   npm install
   ```

   ```bash
   npx playwright install chromium
   ```

3. Put your private key in place. Create a folder called `.auth` in the project and
   copy `server.key` into it, so the file is `.auth/server.key`. The `.auth` folder is
   ignored by git and is never committed.

4. Create your settings file. Copy `.env.example` to a new file called `.env`, then
   fill in the four values:

   ```
   SF_LOGIN_URL=https://your-domain.develop.my.salesforce.com
   SF_USERNAME=you@example.com
   SF_CLIENT_ID=<the consumer key from step 9.4>
   SF_PRIVATE_KEY_PATH=.auth/server.key
   ```

   For a sandbox (not a Developer org), also add
   `SF_JWT_AUDIENCE=https://test.salesforce.com`.

5. Check it works:

   ```bash
   npx playwright test tests/seed.spec.ts
   ```

   Two results should pass: the sign-in and the starting-point test. If the sign-in
   fails, see [Troubleshooting](#18-troubleshooting).

## 11. Set up the AI assistant

Skip this section if you only want to run the tests.

Everything the assistant needs is already in the repository. You only have to open
the folder and switch things on.

**GitHub Copilot in VS Code**

1. Open the project folder in VS Code and open the Copilot chat in **Agent** mode.
2. Open [`.vscode/mcp.json`](.vscode/mcp.json) and start the two servers listed
   there (`playwright` and `playwright-test`). VS Code shows a **Start** link above each.
3. The Skills (`.github/skills/`), the agents (`.github/agents/`) and the saved
   request (`.github/prompts/`) are picked up automatically.

**Claude Code**

1. Open a terminal in the project folder and start Claude Code.
2. Approve the two MCP servers from [`.mcp.json`](.mcp.json) when asked.
3. The Skills, agents and saved request are read from the `.claude/` folder.

To check the browser connection, ask the assistant:

> Open the Cases list in Salesforce and tell me what fields are on the New Case form.

A browser should open, already signed in, and the answer should list the real fields.

## 12. Run the tests

| What you want | Command |
| --- | --- |
| Run everything | `npm test` |
| Watch the browser while it runs | `npm run test:headed` |
| Run one file | `npx playwright test tests/case-lifecycle.spec.ts` |
| Run one test by name | `npx playwright test -g "Escalate a case"` |
| Check the tests follow our conventions | `npm run check` |

A full run takes under a minute and ends with a line such as `8 passed`.

## 13. View the report

```bash
npm run report
```

This opens the HTML report in your browser. For each test you can see:

- the steps it took and how long each one lasted;
- a **video** of the whole test;
- for a failed test, a screenshot at the moment of failure and a **trace** you can
  step through action by action.

The report is in the `playwright-report` folder. It is rebuilt on every run.

## 14. Add a new test case

Use this when the user story stays the same and you want one more test for it.

### With the AI assistant (recommended)

1. **If it is a new rule, write it down first.** Add the acceptance criterion to
   [`docs/case-user-story.md`](docs/case-user-story.md) and the business rule to
   [`.github/skills/case-domain/SKILL.md`](.github/skills/case-domain/SKILL.md).
   (If you use Claude Code, make the same change in `.claude/skills/case-domain/`.)

2. **Ask the planner to add it to the plan.** Pick the **playwright-test-planner**
   agent and ask, for example:

   > Add a scenario to specs/case-lifecycle-plan.md: a case cannot be saved with a
   > Web Email that is not a valid email address. Use the case-domain skill.

3. **Review the plan.** Open `specs/case-lifecycle-plan.md` and read the new
   scenario. Correct it by hand if it is wrong. Do not skip this step.

4. **Ask the generator to write the test.** Pick the **playwright-test-generator**
   agent:

   > Generate the test for the new scenario in specs/case-lifecycle-plan.md. Put it
   > in tests/case-more.spec.ts and follow the write-salesforce-test skill.

5. **Run it, and heal if needed.**

   ```bash
   npx playwright test tests/case-more.spec.ts
   ```

   If it fails, pick the **playwright-test-healer** agent and ask it to run the tests
   and fix the failures. Then decide for yourself: was the test wrong, or is it a
   real bug in Salesforce?

6. **Check the conventions and review the code.**

   ```bash
   npm run check
   ```

### By hand

1. Open [`tests/case-more.spec.ts`](tests/case-more.spec.ts) and copy an existing test.
2. Import `test` and `expect` from `./fixtures`. Use the fixtures it gives you:
   - `subject`: a unique case name. Any case created with it is deleted afterwards.
   - `caseForm`, `caseRecord`: the page objects for the two screens.
   - `api`: checks what was really saved, and sets up data quickly.
3. Follow the rules in
   [`.github/skills/write-salesforce-test/SKILL.md`](.github/skills/write-salesforce-test/SKILL.md).
4. Run `npx playwright test tests/case-more.spec.ts` and `npm run check`.

### Where to put it

| File | Use it for |
| --- | --- |
| `tests/case-more.spec.ts` | New tests for the Case story. **Put new tests here.** |
| `tests/case-lifecycle.spec.ts` | The three demo tests. This file is deleted and rewritten by the demo, so do not add to it. |
| A new `tests/<name>.spec.ts` | A larger group of tests. If you use the demo reset, add the file to the `kept` list in `scripts/demo.mjs` so it is not deleted. |

## 15. Add a new user story

Use this for a different feature, for example Accounts or Contacts.

1. **Write the user story.** Create `docs/<feature>-user-story.md` with the story and
   numbered acceptance criteria. Copy the layout of
   [`docs/case-user-story.md`](docs/case-user-story.md).

2. **Write the business rules as a Skill.** Create
   `.github/skills/<feature>-domain/SKILL.md`. Copy
   [`case-domain`](.github/skills/case-domain/SKILL.md) and replace its content:
   what the thing is, its fields, its rules, what matters most. This is plain
   English and is the most valuable file you will write.
   (If you use Claude Code, copy the folder to `.claude/skills/` too.)

3. **Optional: get manual test cases first.** Ask the assistant:

   > Write test cases for docs/<feature>-user-story.md.

   It follows the `write-test-cases` Skill and returns one table with positive,
   negative and exception cases. Reviewing these is a quick way to find gaps in the
   story before any automation.

4. **Plan.** Pick the **playwright-test-planner** agent:

   > Plan tests for docs/<feature>-user-story.md. Start from the <feature> list page.
   > Use the <feature>-domain skill for the business rules. Save the plan as
   > specs/<feature>-plan.md.

5. **Review the plan** and correct it.

6. **Generate.** Pick the **playwright-test-generator** agent:

   > Generate the tests in specs/<feature>-plan.md into tests/<feature>.spec.ts.
   > Follow the write-salesforce-test skill. Create page objects in tests/pages/
   > for any new screens.

   For a new Salesforce object the generator will also need to extend
   [`tests/support/salesforce-api.ts`](tests/support/salesforce-api.ts) so tests can
   check and delete their own records. Review that change carefully.

7. **Run, heal, check and review**, as in section 14.

8. **If the AI got something wrong that it will get wrong again**, add a rule to
   the `write-salesforce-test` Skill.

## 16. The delete-and-regenerate demo

This shows the whole flow live. [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) has the full run
sheet and a one-sentence explanation of every file.

| Step | Command | What happens |
| --- | --- | --- |
| 1 | `npm test` | Shows everything passing |
| 2 | `npm run demo:reset:all` | Deletes the framework, the page objects, the plan and the three Case lifecycle tests. The other tests are kept. |
| 3 | `/generate-case-tests` in the AI assistant | The Skill's kit puts the framework back; the planner, generator and healer write the plan and the three tests |
| 4 | `npm test`, then `npm run report` | Shows the regenerated tests passing |
| If it stalls | `npm run demo:restore` | Puts the committed versions back |

Be clear about what is and is not generated: the **framework** comes back from a kit
that people wrote and reviewed, stored inside the `write-salesforce-test` Skill. The
**plan and tests** are written fresh from the story, the rules and the real page.

`npm run demo:generate` runs the same request from the command line if the Claude
Code CLI is installed.

## 17. Run in GitHub Actions

The workflow [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)
runs the tests on demand and uploads the report.

1. In the GitHub repository, go to **Settings › Secrets and variables › Actions** and
   add four repository secrets:

   | Secret | Value |
   | --- | --- |
   | `SF_LOGIN_URL` | Your My Domain login address |
   | `SF_USERNAME` | The user the tests run as |
   | `SF_CLIENT_ID` | The consumer key |
   | `SF_PRIVATE_KEY` | The whole contents of `server.key` |

2. Go to **Actions › Salesforce Playwright tests › Run workflow**.
3. When it finishes, download the `playwright-report` artifact from the run page.

## 18. Troubleshooting

| What you see | Likely cause | What to do |
| --- | --- | --- |
| `user hasn't approved this consumer` | The user is not pre-authorised on the app | Section 9.3: set Permitted Users and add the profile |
| `invalid client` or `client identifier invalid` | Wrong consumer key | Copy `SF_CLIENT_ID` again (section 9.4), with no spaces |
| `invalid assertion` or `invalid_grant` | The certificate in Salesforce does not match your private key, or the audience is wrong | Upload the `server.crt` that was made with your `server.key`. For a sandbox set `SF_JWT_AUDIENCE` |
| The token works but the browser shows the login page | The `web` scope is missing | Section 9.2, step 6. Wait a few minutes after saving |
| "Verify Your Identity" page | The password fallback is being used because `SF_CLIENT_ID` is not set | Fill in `SF_CLIENT_ID` and the key path in `.env` |
| `Missing SF_LOGIN_URL ...` | `.env` is missing or incomplete | Section 10, step 4 |
| A test times out choosing a picklist value | Lightning re-rendered the form | Use `choosePicklistOption` from `tests/support/lightning.ts`, never click an option directly |
| `No tests found`, or the `tests` folder is empty | The demo reset was run and nothing regenerated | `npm run demo:restore` |
| It worked yesterday and fails today | A setting changed in Salesforce, or the app was edited | Run `npx playwright test tests/seed.spec.ts` to test sign-in alone |

## 19. Repository map

```
docs/
  case-user-story.md                the user story and acceptance criteria
  skill-comparison/                 the same request answered without and with a Skill
specs/
  case-lifecycle-plan.md            the planner's test plan, in plain English
tests/
  auth.setup.ts                     signs in once and saves the session
  fixtures.ts                       gives each test a unique case name and cleans up
  seed.spec.ts                      the starting point the agents begin from
  case-lifecycle.spec.ts            three tests (rewritten by the demo)
  case-more.spec.ts                 more tests (add new ones here)
  generated/                        a test written with the generator's own tool
  pages/                            page objects: New Case form, Case record page
  support/
    salesforce-auth.ts              the JWT sign-in and the front door link
    salesforce-api.ts               checks saved data, creates and deletes records
    lightning.ts                    reliable picklist helper for Lightning
.github/
  skills/case-domain/               Skill: the business rules for cases
  skills/write-salesforce-test/     Skill: how we write tests, plus the framework kit
  skills/write-test-cases/          Skill: the manual test case template
  agents/                           Playwright planner, generator and healer
  prompts/                          the saved request that regenerates the tests
  workflows/playwright.yml          GitHub Actions workflow
.claude/                            the same Skills, agents and request for Claude Code
.vscode/mcp.json, .mcp.json         the Playwright MCP servers
scripts/demo.mjs                    demo:reset:all, demo:generate, demo:restore
playwright.config.ts                settings: where Salesforce is, timeouts, video
DEMO-SCRIPT.md                      run sheet for the live demo
```

The Skills exist in two places, `.github/skills/` and `.claude/skills/`, because the
two assistants look in different folders. If you change a Skill, change both copies.

## 20. Keeping secrets safe

- **Never commit** `.env`, the `.auth` folder or `server.key`. All three are already
  in `.gitignore`.
- The private key signs you in as your Salesforce user. Treat it like a password.
  If it is ever shared or committed, delete the certificate from the External Client
  App and make a new pair (section 9.1).
- Use a Developer org or a test sandbox, never production.
- Do not put real customer, worker or production data in front of an AI tool that
  has not been approved for it. Everything an AI agent reads, including a page it
  opens in a browser, is sent to the AI provider.
