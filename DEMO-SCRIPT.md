# Demo run sheet: delete the code, get it back, run it

The point: all the test code is deleted in front of the audience. An AI agent brings it
back using our Skills, the Playwright MCP server and the Playwright agents, and the
tests pass against Salesforce.

## What comes back, and from where

| What | Where it comes from | Why |
| --- | --- | --- |
| Framework: config, sign-in, helpers, page objects | The `write-salesforce-test` **Skill** carries it as a kit | It is our standard kit, the same for every Salesforce project |
| Test plan (`specs/`) | **Planner** agent, looking at the real page through the **Playwright MCP server**, using the `case-domain` **Skill** for the rules | It is specific to this user story |
| Three tests (`tests/case-lifecycle.spec.ts`) | **Generator** agent, following the `write-salesforce-test` **Skill** | Written from the plan, in our style |
| A passing run | **Healer** agent runs and repairs | Proves it works |

## Before the session

- `.env` filled in and the private key at `.auth/server.key`.
- One full rehearsal of the steps below the night before, and again 30 minutes before.
  Time step 4; it is the slow one.
- Open: this folder in VS Code (or a terminal with Claude Code), and Salesforce in a browser tab.

## The steps

**1. Show where we start (1 min)**

```bash
npm test
```

Eight tests pass. Open the `tests` folder: "all of this is about to go".

**2. Delete it (30 sec)**

```bash
npm run demo:reset:all
```

The `tests` folder, the plan and `playwright.config.ts` are gone. Show the file explorer.
(For a shorter demo use `npm run demo:reset`, which removes only the plan and the three tests.)

**3. Show what the AI is given (2 min)**

- `docs/case-user-story.md`: the story.
- `.github/skills/case-domain/SKILL.md`: the business rules, one page of plain English.
- `.github/skills/write-salesforce-test/SKILL.md`: how we write tests, plus the framework kit.
- `.vscode/mcp.json`: the Playwright MCP servers.
- `.github/prompts/generate-case-tests.prompt.md`: the request. Read the three tests aloud.

**4. Bring it back (6 to 10 min)**

In the AI chat (agent mode), run the saved prompt:

> /generate-case-tests

Narrate what scrolls past:

- **Framework:** the Skill's kit goes back in place, nine files, and sign-in is proved.
- **Business rules:** it reads the `case-domain` Skill.
- **Planner:** a browser opens on Salesforce, already signed in; it reads the New Case
  form and saves the plan.
- **Generator:** it writes the three tests, reusing our page objects.
- **Healer:** it runs them and fixes anything that fails.

**5. Read what came back (2 min)** — use the code tour below.

**6. Run it (1 min)**

```bash
npm test
```

```bash
npm run report
```

The report has a video of each test.

## If the live step stalls

```bash
npm run demo:restore
```

That puts back the committed code. Say so plainly, then continue from step 5.

## Code tour: how to explain each file in one sentence

**The kit (put back by the Skill)**

| File | Say this |
| --- | --- |
| `playwright.config.ts` | "The settings: where Salesforce is, how long to wait, record a video." |
| `tests/auth.setup.ts` | "Signs in once, before any test, and saves the session." |
| `tests/support/salesforce-auth.ts` | "How it signs in: a signed token instead of a password, so there is no code to type in." |
| `tests/support/salesforce-api.ts` | "Asks Salesforce directly what was saved, and cleans up afterwards." |
| `tests/support/lightning.ts` | "One helper for Salesforce drop-downs, which are fiddly. Learned the hard way." |
| `tests/fixtures.ts` | "Gives every test a unique case name and deletes that case at the end." |
| `tests/pages/*.page.ts` | "One file per screen. It knows where the fields and buttons are, so the tests do not have to." |

**Written by the agents**

| File | Say this |
| --- | --- |
| `specs/case-lifecycle-plan.md` | "The plan, in plain English. Review this first; it is the cheapest place to catch a mistake." |
| `tests/case-lifecycle.spec.ts` | "Three tests. Each reads like the plan: do something, check the screen, check the data." |

If you only open one file, open the last one and read a test aloud.
