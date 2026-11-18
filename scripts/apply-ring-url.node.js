/**
 * `npm run ring -- "<hero-lab url>"`: bakes a hero-lab ring setup into `RING_DEFAULTS`.
 *
 * Paste the whole URL from the lab's ring tab (the `r_<field>` params are the setup). Every value in it is written into
 * `RING_DEFAULTS` in components/play-board/HeroVariants.tsx. Fields the URL leaves out keep their current default. Nothing
 * is written if any value is unknown or invalid.
 *
 *   npm run ring -- "http://localhost:3000/hero-lab?tab=ring&r_d=140&r_w=3"
 *   npm run ring -- --dry "<url>"      show the changes, write nothing
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'components', 'play-board', 'HeroVariants.tsx');
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const input = args.find(a => !a.startsWith('--'));
if (!input) {
  console.error('Usage: npm run ring -- [--dry] "<hero-lab url>"');
  process.exit(1);
}

let params;
try {
  // A bare query ("r_d=140&r_w=3") is not a URL; give it a `?`.
  params = new URL(input.includes('?') || !input.includes('=') ? input : `?${input}`, 'http://localhost').searchParams;
} catch (e) {
  console.error(`Not a valid URL: ${input}`);
  process.exit(1);
}

const src = fs.readFileSync(FILE, 'utf8');
const start = src.indexOf('export const RING_DEFAULTS');
const end = start < 0 ? -1 : src.indexOf('\n};', start);
if (end < 0) {
  console.error('Could not find RING_DEFAULTS in ' + FILE);
  process.exit(1);
}
let block = src.slice(start, end);

const errors = [];
const changes = [];
let found = 0;
for (const [key, raw] of params) {
  if (!key.startsWith('r_')) continue;
  found++;
  const field = key.slice(2);
  const re = new RegExp(`^(\\s+${field}:\\s*)(.+?)(,?)$`, 'm');
  const m = block.match(re);
  if (!m) { errors.push(`${key}: no such field in RING_DEFAULTS`); continue; }
  const old = m[2];
  let next;
  if (old === 'true' || old === 'false') {
    if (raw !== '0' && raw !== '1') { errors.push(`${key}: expected 0 or 1, got "${raw}"`); continue; }
    next = raw === '1' ? 'true' : 'false';
  } else if (/^'/.test(old)) {
    if (!/^[0-9a-f]{6}$/i.test(raw)) { errors.push(`${key}: expected a 6-digit hex colour, got "${raw}"`); continue; }
    next = `'${raw.toLowerCase()}'`;
  } else {
    if (raw === '' || Number.isNaN(+raw)) { errors.push(`${key}: expected a number, got "${raw}"`); continue; }
    next = String(+raw);
  }
  if (next !== old) changes.push(`${field}: ${old} -> ${next}`);
  block = block.replace(re, `$1${next}$3`);
}

if (errors.length) {
  console.error('Nothing written:\n  ' + errors.join('\n  '));
  process.exit(1);
}
if (!found) {
  console.error('No r_<field> params in that URL, nothing to apply.');
  process.exit(1);
}
if (!changes.length) {
  console.log('Already matches RING_DEFAULTS, nothing to change.');
  process.exit(0);
}
console.log((dry ? 'Would change:\n  ' : 'Changed:\n  ') + changes.join('\n  '));
if (!dry) fs.writeFileSync(FILE, src.slice(0, start) + block + src.slice(end));
