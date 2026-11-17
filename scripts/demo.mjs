// Helpers for the live demo.
//   npm run demo:reset     delete the plan and the generated test file
//   npm run demo:generate  regenerate them with an AI agent (Skills + MCP + Playwright agents)
//   npm run demo:restore   put the committed versions back (the safety net)
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const targets = ['specs/case-lifecycle-plan.md', 'tests/case-lifecycle.spec.ts'];
const promptFile = 'prompts/generate-case-tests.md';
const mode = process.argv[2];

if (mode === 'reset') {
  for (const file of targets) {
    if (existsSync(file)) { rmSync(file); console.log(`deleted   ${file}`); } else console.log(`(already gone) ${file}`);
  }
  console.log('\nThe plan and the test script are gone. Next: npm run demo:generate');
} else if (mode === 'restore') {
  execFileSync('git', ['checkout', 'HEAD', '--', ...targets], { stdio: 'inherit' });
  for (const file of targets) console.log(`restored  ${file}`);
} else if (mode === 'generate') {
  const prompt = readFileSync(promptFile, 'utf8');
  const hasClaude = spawnSync('claude', ['--version'], { shell: true }).status === 0;
  if (!hasClaude) {
    console.log('No command-line AI agent found on this machine.\n');
    console.log('In VS Code (Copilot agent mode) or Claude Code, run the saved prompt instead:\n');
    console.log('    /generate-case-tests\n');
    console.log(`It is the same text as ${promptFile}.`);
    process.exit(1);
  }
  // The prompt goes in on standard input. What the agent may do without asking
  // (edit files, run the tests, use the two Playwright MCP servers) is set in .claude/settings.json.
  const run = spawnSync('claude -p --permission-mode acceptEdits', { input: prompt, stdio: ['pipe', 'inherit', 'inherit'], shell: true });
  process.exit(run.status ?? 1);
} else {
  console.log('Usage: node scripts/demo.mjs reset | generate | restore');
  process.exit(1);
}
