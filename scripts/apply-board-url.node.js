/**
 * `npm run board -- "<url or query>"`: bakes a board-lab layout into
 * `PLAY_LAYOUT` (what /play uses).
 *
 * Paste the board-lab URL, or just its query (`les=0.8&lex=-1281&ley=-49`).
 * Every layout knob in it (`l...` params) is written into
 * `PLAY_LAYOUT` in components/play-board/layout-css.ts: a knob already there is
 * changed, a new one is added at the end. Knobs the
 * URL leaves out keep their saved value. Left alone on purpose: the board setup
 * (b0 p0 h0 ... herotype, which are not layout) and
 * the lab's preview switches (anything ending in `pv`: lpv, lcpv, lenpv ...).
 *
 *   npm run board -- "http://localhost:3000/board-lab?les=0.8&lex=-1281&lry0=151"
 *   npm run board -- --dry "les=0.8&lex=-1281"      show the changes, write nothing
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(
  __dirname,
  '..',
  'components',
  'play-board',
  'layout-css.ts',
);
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const input = args.find((a) => !a.startsWith('--'));
if (!input) {
  console.error('Usage: npm run board -- [--dry] "<board-lab url or query>"');
  process.exit(1);
}

// A bare query ("a=1&b=2") is not a URL; give it a base and a `?`.
const params = new URL(
  input.includes('?') || !input.includes('=') ? input : `?${input}`,
  'http://localhost',
).searchParams;

const src = fs.readFileSync(FILE, 'utf8');
const start = src.indexOf('export const PLAY_LAYOUT');
const end = start < 0 ? -1 : src.indexOf('\n};', start);
if (end < 0) {
  console.error('Could not find PLAY_LAYOUT in ' + FILE);
  process.exit(1);
}
let block = src.slice(start, end);

const errors = [];
const changes = [];
const skipped = [];
let found = 0;
for (const [key, value] of params) {
  if (!/^l[a-z0-9]+$/i.test(key) || /pv$/.test(key)) {
    skipped.push(key);
    continue;
  }
  found++;
  if (!/^[\w.,%#:+ -]*$/.test(value)) {
    errors.push(`${key}: unexpected characters in "${value}"`);
    continue;
  }
  const re = new RegExp(`^(\\s+${key}:\\s*')([^']*)(',?)$`, 'm');
  const m = block.match(re);
  if (m) {
    if (m[2] !== value) changes.push(`${key}: ${m[2]} -> ${value}`);
    block = block.replace(re, `$1${value}$3`);
  } else {
    changes.push(`${key}: (new) ${value}`);
    block += `\n  ${key}: '${value}',`;
  }
}

if (errors.length) {
  console.error('Nothing written:\n  ' + errors.join('\n  '));
  process.exit(1);
}
if (skipped.length) console.log(`Ignored (not layout): ${skipped.join(', ')}`);
if (!found) {
  console.error('No layout (l...) params in that URL, nothing to apply.');
  process.exit(1);
}
if (!changes.length) {
  console.log('Already matches PLAY_LAYOUT, nothing to change.');
  process.exit(0);
}
console.log(
  (dry ? 'Would change:\n  ' : 'Changed:\n  ') + changes.join('\n  '),
);
if (!dry) fs.writeFileSync(FILE, src.slice(0, start) + block + src.slice(end));
