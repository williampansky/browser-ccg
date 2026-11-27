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
 *   npm run board -- --tier=medium "<url>"   bake into a smaller screen size
 *
 * `--tier=medium|small` writes into that tier's override map
 * (`PLAY_LAYOUT_TIERS`) instead: only the knobs that differ from the tier above
 * (small starts from medium, medium from the base). Use it with a lab URL that
 * has `dev=<tier>`; `dev` itself is not a layout knob and is skipped.
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
const tierArg = args.find((a) => a.startsWith('--tier='));
const tier = tierArg ? tierArg.slice('--tier='.length) : 'large';
if (!['large', 'medium', 'small'].includes(tier)) {
  console.error('--tier must be large, medium or small');
  process.exit(1);
}
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

const urlTier = params.get('dev');
if (urlTier && urlTier !== tier) {
  console.error(
    `That URL is for dev=${urlTier}; add --tier=${urlTier} (or drop dev=).`,
  );
  process.exit(1);
}

let src = fs.readFileSync(FILE, 'utf8');
let start;
let end;
if (tier === 'large') {
  start = src.indexOf('export const PLAY_LAYOUT:');
  end = start < 0 ? -1 : src.indexOf('\n};', start);
} else {
  // A tier's map is `  medium: {},` when empty; open it up so keys can be added.
  const open = `  ${tier}: {},`;
  const tiers = src.indexOf('export const PLAY_LAYOUT_TIERS');
  const at = src.indexOf(open, tiers);
  if (tiers >= 0 && at >= 0) src = src.replace(open, `  ${tier}: {\n  },`);
  start = src.indexOf(`  ${tier}: {`, tiers);
  end = start < 0 ? -1 : src.indexOf('\n  },', start);
}
if (end < 0 || start < 0) {
  console.error('Could not find the layout map for ' + tier + ' in ' + FILE);
  process.exit(1);
}
let block = src.slice(start, end);
const pad = tier === 'large' ? '  ' : '    ';

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
    block += `\n${pad}${key}: '${value}',`;
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
  console.log(`Already matches the ${tier} layout, nothing to change.`);
  process.exit(0);
}
console.log(
  (dry ? 'Would change:\n  ' : 'Changed:\n  ') + changes.join('\n  '),
);
if (!dry) fs.writeFileSync(FILE, src.slice(0, start) + block + src.slice(end));
