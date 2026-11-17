// Puts our standard Salesforce test framework in place from this Skill's kit.
//   node .github/skills/write-salesforce-test/scripts/scaffold.mjs [--force]
// Existing files are left alone unless --force is given.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const kit = join(dirname(fileURLToPath(import.meta.url)), '..', 'templates', 'framework');
const force = process.argv.includes('--force');

const files = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});

let created = 0;
for (const source of files(kit)) {
  const target = relative(kit, source);
  if (existsSync(target) && !force) { console.log(`kept      ${target}`); continue; }
  mkdirSync(dirname(target) || '.', { recursive: true });
  cpSync(source, target);
  console.log(`created   ${target}`);
  created++;
}
console.log(`\nFramework kit: ${created} file(s) put in place. Next: npx playwright test tests/seed.spec.ts`);
