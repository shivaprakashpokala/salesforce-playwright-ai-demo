// Helpers for the live demo.
//   npm run demo:reset       delete the plan and the three generated tests
//   npm run demo:reset:all   delete ALL the test code: framework, page objects, tests, plan, config
//                            (except the hand-written specs in `kept`, which nothing regenerates)
//   npm run demo:generate    have an AI agent put everything back (Skills + MCP + Playwright agents)
//   npm run demo:restore     put the committed versions back (the safety net)
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';

const generated = ['specs/case-lifecycle-plan.md', 'tests/case-lifecycle.spec.ts'];
const everything = ['specs/case-lifecycle-plan.md', 'tests', 'playwright.config.ts'];
// Hand-written tests that no reset deletes: the generate prompt only writes the three in
// tests/case-lifecycle.spec.ts, so anything deleted here would never come back.
const kept = ['tests/case-more.spec.ts', 'tests/generated/new-case-defaults.spec.ts'];
const kit = '.github/skills/write-salesforce-test/templates/framework';
const promptFile = '.github/prompts/generate-case-tests.prompt.md';
const mode = process.argv[2];

const remove = (paths) => {
  for (const path of paths) {
    if (existsSync(path)) { rmSync(path, { recursive: true }); console.log(`deleted   ${path}`); } else console.log(`(already gone) ${path}`);
  }
};
const files = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});

if (mode === 'reset') {
  remove(generated);
  console.log('\nThe plan and the test script are gone. Next: npm run demo:generate');
} else if (mode === 'reset-all') {
  // Keep the Skill's kit in step with the framework as it is today, so what comes back is what was here.
  for (const template of files(kit)) {
    const live = relative(kit, template);
    if (existsSync(live)) cpSync(live, template);
  }
  const saved = kept.filter(existsSync).map((path) => [path, readFileSync(path)]);
  remove(everything);
  for (const [path, content] of saved) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log(`kept      ${path}`);
  }
  console.log('\nAll the generated test code is gone: framework, page objects, the Case lifecycle tests, plan and config.');
  console.log('Still here: the Skills, the agents, the MCP settings and your sign-in details. Next: npm run demo:generate');
} else if (mode === 'restore') {
  execFileSync('git', ['checkout', 'HEAD', '--', ...everything], { stdio: 'inherit' });
  console.log('restored  the committed plan, tests, framework and config');
} else if (mode === 'generate') {
  const prompt = readFileSync(promptFile, 'utf8').replace(/^---[\s\S]*?---\s*/, '');
  const hasClaude = spawnSync('claude --version', { shell: true }).status === 0;
  if (!hasClaude) {
    console.log('No command-line AI agent found on this machine.\n');
    console.log('In VS Code (Copilot agent mode) or Claude Code, run the saved prompt instead:\n');
    console.log('    /generate-case-tests\n');
    console.log(`It is the same text as ${promptFile}.`);
    process.exit(1);
  }
  // The prompt goes in on standard input. What the agent may do without asking is set in .claude/settings.json.
  const run = spawnSync('claude -p --permission-mode acceptEdits', { input: prompt, stdio: ['pipe', 'inherit', 'inherit'], shell: true });
  process.exit(run.status ?? 1);
} else {
  console.log('Usage: node scripts/demo.mjs reset | reset-all | generate | restore');
  process.exit(1);
}
