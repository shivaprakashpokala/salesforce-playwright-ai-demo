// Checks Playwright tests against the team rules in SKILL.md.
//   node check-conventions.mjs [folder]     (default: tests)
// Exits with code 1 if anything is found, so an AI agent (or CI) can act on it.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const rules = [
  { pattern: /waitForTimeout\s*\(/, message: 'Fixed wait. Use a web-first assertion instead.' },
  { pattern: /locator\(\s*['"`](\/\/|xpath=)/, message: 'XPath locator. Use getByRole or getByLabel.' },
  { pattern: /locator\(\s*['"`][.#][\w-]/, message: 'CSS class or id locator. Use getByRole or getByLabel.' },
  { pattern: /\.(nth\(\d+\)|first\(\)|last\(\))/, message: 'Position-based locator. Find the element by name.' },
  { pattern: /expect\(\s*await\s+[^)]*\.is(Visible|Hidden|Enabled|Checked)\(/, message: 'Not a web-first assertion. Use await expect(locator).toBeVisible() and friends.' },
  { pattern: /\b(19|20)\d{2}-\d{2}-\d{2}\b/, message: 'Hard-coded date. Compute it relative to today.' },
  { pattern: /\bexpect\s*\(/, message: 'Assertion inside a page object. Move it to the spec.', only: /\.page\.ts$/ },
];

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : /\.ts$/.test(name) ? [path] : [];
});

const folder = process.argv[2] ?? 'tests';
const files = walk(folder);
let found = 0;
for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//')) return;
    for (const rule of rules) {
      if (rule.only && !rule.only.test(file)) continue;
      if (rule.pattern.test(line)) { found++; console.log(`${file}:${i + 1}  ${rule.message}`); }
    }
  });
}
console.log(found ? `\n${found} issue(s) in ${files.length} file(s).` : `Conventions check: no issues in ${files.length} file(s).`);
process.exit(found ? 1 : 0);
