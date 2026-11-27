// scripts/bump.js
const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../package.json');
const tsPath = path.resolve(__dirname, '../app.config.ts');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
let [major, minor, patch] = pkg.version.split('.').map(Number);

const args = process.argv.slice(2);
if (args.includes('--major') || process.env.npm_config_major) {
  major++;
  minor = 0;
  patch = 0;
} else if (args.includes('--minor') || process.env.npm_config_minor) {
  minor++;
  patch = 0;
} else if (args.includes('--patch') || process.env.npm_config_patch) {
  patch++;
} else {
  console.error('Specify -- --major, -- --minor, or -- --patch');
  process.exit(1);
}

pkg.version = `${major}.${minor}.${patch}`;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// Update the integer in the .ts file
let tsContent = fs.readFileSync(tsPath, 'utf8');
tsContent = tsContent.replace(
  /(version:\s*['"])([^'"]+)(['"])/,
  `$1${pkg.version}$3`
);
fs.writeFileSync(tsPath, tsContent);

console.log(`Bumped version to ${pkg.version}`);
