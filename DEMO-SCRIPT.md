# Demo run sheet: delete the tests, regenerate them, run them (about 12 minutes)

The point of the demo: the plan and the test script are deleted in front of the
audience, an AI agent writes them again using our Skills, the Playwright MCP server
and the Playwright agents, and the new tests pass against Salesforce.

## The three scenarios

1. Create a case with its key details
2. Do not save a case without a Case Origin
3. Escalate a case from its record page

## Before the session

- `.env` filled in and the private key at `.auth/server.key` (see README, "Signing in").
- One full rehearsal of everything below, the night before and again 30 minutes before.
- Open: this folder in VS Code (or a terminal with Claude Code), and Salesforce in a browser tab.

## Step 1 - Show where we start (1 min)

```bash
npm test
```

Eight tests pass. Open `tests/case-lifecycle.spec.ts` and `specs/case-lifecycle-plan.md`
briefly: "this is what we are about to throw away".

## Step 2 - Delete them (30 sec)

```bash
npm run demo:reset
```

Show the two files are gone in the file explorer.

## Step 3 - Show what the AI will be given (2 min)

- `.github/skills/case-domain/SKILL.md`: the business context. One page, plain English.
- `.github/skills/write-salesforce-test/SKILL.md`: how we write Salesforce tests.
- `.vscode/mcp.json`: the Playwright MCP servers, a few lines.
- `.github/agents/`: planner, generator, healer.
- `prompts/generate-case-tests.md`: the request itself. Read the three scenarios aloud.

## Step 4 - Regenerate (5 to 8 min)

In the AI chat (VS Code Copilot agent mode, or Claude Code), run the saved prompt:

> /generate-case-tests

Or, with the Claude Code command line installed, from a terminal:

```bash
npm run demo:generate
```

While it works, narrate what scrolls past:

- It reads the `case-domain` skill first (business rules).
- **Planner:** a browser opens on Salesforce, already signed in; it reads the New Case
  form as a snapshot and saves `specs/case-lifecycle-plan.md`.
- **Generator:** it writes `tests/case-lifecycle.spec.ts`, reusing our page objects.
- **Healer:** it runs the tests and fixes anything that fails.

This is the slowest step. Keep talking; do not fill the silence by typing.

## Step 5 - Read what it wrote (2 min)

- Open the new `specs/case-lifecycle-plan.md`. Find "Do not save a case without a
  Case Origin": that rule came from the skill, not from the page.
- Open the new `tests/case-lifecycle.spec.ts`. Point at label-based locators, the page
  objects, and the double check (screen and API). All from the skill.

## Step 6 - Run it (1 min)

```bash
npm test
```

```bash
npm run report
```

## If the live generation stalls

```bash
npm run demo:restore
```

That puts back the committed plan and tests (written the same way, earlier). Say so
plainly, then continue from Step 5.

## Optional: the contrast

Before Step 4, ask a plain chat assistant with no Skills and no MCP server: "Write a
Playwright test that creates a Salesforce case." It will guess the element names. Show
it, do not run it, and move on.
