// Pre-commit check: blocks commits that add key-looking strings or a .env file.
// Run by .githooks/pre-commit. Only inspects lines being added (staged diff).
const { execSync } = require('child_process');

const KEY_PATTERN = /(duffel_(test|live)_|sand_)[A-Za-z0-9_\-]{20,}/;

const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
  .split('\n').filter(Boolean);

const problems = [];

for (const file of staged) {
  if (/(^|\/)\.env$/.test(file)) problems.push(`${file}: .env files must never be committed`);
}

const diff = execSync('git diff --cached -U0 --no-color', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
let current = '';
for (const line of diff.split('\n')) {
  if (line.startsWith('+++ b/')) current = line.slice(6);
  else if (line.startsWith('+') && !line.startsWith('+++') && KEY_PATTERN.test(line))
    problems.push(`${current}: looks like an API key (value hidden)`);
}

if (problems.length) {
  console.error('Commit blocked:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
