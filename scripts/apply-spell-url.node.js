/**
 * `npm run spell -- "<spells-lab url>"`: bakes a spells-lab setup into the game.
 *
 * Paste the whole URL from the lab. What it writes:
 *
 * - `sp=<key>` (a card id such as `CORE_069`, `FIGHTER:1` for a hero
 *   skill, or an event such as `summon`) names the spell. Its `s_<field>` params go into that spell's entry
 *   in `SPELL_FX_VARIANTS` (components/play-board/spell-fx-tune.ts), merged
 *   over the entry already there. A value equal to the default in
 *   `SPELL_FX_DEFAULTS` is left out (and removes an older override), so a
 *   later change of the defaults still reaches every spell that did not
 *   override it.
 * - `e=<base>` (`travel`, `strike` or `spot`) assigns the spell's base
 *   effect in `SKILL_FX` (a skill), `CARD_FX` (a card) or `EVENT_FX` (an event) in
 *   components/play-board/spell-fx.ts. Leave it out to keep the assignment;
 *   `travel` is the default, so it removes an entry.
 * - With `--defaults` there is no spell: the `s_<field>` params are written
 *   into `SPELL_FX_DEFAULTS` instead (every spell without an override).
 *
 * Nothing is written if any key, field or value is invalid. `speed` and other
 * preview-only params are ignored on purpose.
 *
 *   npm run spell -- "http://localhost:3000/spells-lab?sp=FIGHTER%3A1&e=spot&s_spotRadius=150"
 *   npm run spell -- --dry "<url>"          show the changes, write nothing
 *   npm run spell -- --defaults "<url>"     bake into SPELL_FX_DEFAULTS
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PLAY = path.join(ROOT, 'components', 'play-board');
const TUNE_FILE = path.join(PLAY, 'spell-fx-tune.ts');
const FX_FILE = path.join(PLAY, 'spell-fx.ts');
const CLASSES_FILE = path.join(ROOT, 'engine', 'heroes', 'classes.ts');
const DATA_DIR = path.join(ROOT, 'data');

const DEFAULT_BASE = 'travel';
const SKILL_KEY = /^([A-Z]+):(\d+)$/;
const CARD_KEY = /^[A-Z]+_\d+[a-z]?$/;

/** The text of the object literal `export const <name>...= {` ... `};`. */
const findBlock = (src, name) => {
  const start = src.indexOf(`export const ${name}`);
  if (start < 0) throw new Error(`Could not find ${name}`);
  const open = src.indexOf('= {', start) + 2;
  if (open < 2) throw new Error(`Could not read ${name}`);
  // An empty literal sits on one line: `= {};`.
  if (src.startsWith('{};', open)) {
    return { start, open, close: open + 3, body: '' };
  }
  const close = src.indexOf('\n};', open);
  if (close < 0) throw new Error(`Could not read ${name}`);
  return { start, open, close: close + 3, body: src.slice(open + 1, close) };
};

const parseValue = (text) => {
  if (text === 'true' || text === 'false') return text === 'true';
  if (text.startsWith("'")) return text.slice(1, -1);
  return Number(text);
};

const formatValue = (value) =>
  typeof value === 'string' ? `'${value}'` : String(value);

/** `{ field: value }` pairs of a flat literal, in file order. */
const parseFlat = (body) => {
  const fields = new Map();
  for (const m of body.matchAll(/^\s+([A-Za-z]\w*|'[^']+'):\s*(.+?),?\s*$/gm)) {
    fields.set(m[1].replace(/'/g, ''), parseValue(m[2]));
  }
  return fields;
};

/** The variants literal: `'KEY': { field: value, ... },` entries. */
const parseVariants = (body) => {
  const variants = new Map();
  // Prettier drops the quotes from a key that is a plain word (`summon:`), so
  // an entry may be written either way.
  for (const m of body.matchAll(/(?:'([^']+)'|(\w+)):\s*\{([^}]*)\}/g)) {
    variants.set(m[1] ?? m[2], parseFlat(m[3]));
  }
  return variants;
};

const formatVariants = (variants, order) => {
  if (variants.size === 0) return '= {};';
  const entries = [...variants]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, fields]) => {
      const lines = [...fields]
        .sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
        .map(([field, value]) => `    ${field}: ${formatValue(value)},`);
      return `  '${key}': {\n${lines.join('\n')}\n  },`;
    });
  return `= {\n${entries.join('\n')}\n};`;
};

const formatAssignments = (map) => {
  if (map.size === 0) return '= {};';
  const lines = [...map]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, kind]) => `  '${key}': '${kind}',`);
  return `= {\n${lines.join('\n')}\n};`;
};

const replaceBlock = (src, name, text) => {
  const { start, open, close } = findBlock(src, name);
  return src.slice(0, open - 2) + text + src.slice(close);
};

/** The words each choice field takes, from `SPELL_FX_CHOICES`. */
const parseChoices = (src) => {
  const choices = new Map();
  const { body } = findBlock(src, 'SPELL_FX_CHOICES');
  for (const m of body.matchAll(/^\s+(\w+):\s*\[([^\]]*)\]/gm)) {
    choices.set(
      m[1],
      [...m[2].matchAll(/'([^']+)'/g)].map((word) => word[1]),
    );
  }
  return choices;
};

const hasCard = (id) =>
  fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.json'))
    .some((file) =>
      fs.readFileSync(path.join(DATA_DIR, file), 'utf8').includes(`"${id}"`),
    );

/**
 * Works out the new file texts for a lab URL. Returns `{ errors, changes,
 * tune, fx }`; `tune` and `fx` are the new source texts (unchanged when there
 * is nothing to write there).
 */
const plan = ({ url, isDefaults, tuneSrc, fxSrc, classKeys, cardExists }) => {
  const choices = parseChoices(tuneSrc);
  const eventKeys = [...parseFlat(findBlock(fxSrc, 'EVENT_FX').body).keys()];
  const errors = [];
  const changes = [];
  const params = new URL(
    url.includes('?') || !url.includes('=') ? url : `?${url}`,
    'http://localhost',
  ).searchParams;

  const defaults = parseFlat(findBlock(tuneSrc, 'SPELL_FX_DEFAULTS').body);
  const order = [...defaults.keys()];
  const kinds = (fxSrc.match(/export type SpellFxKind =([^;]+);/) || [, ''])[1]
    .split('|')
    .map((kind) => kind.trim().replace(/'/g, ''));

  const key = params.get('sp');
  if (isDefaults) {
    if (key) errors.push('--defaults takes no sp=<spell>');
  } else if (!key) {
    errors.push('No sp=<spell> in that URL (use --defaults for the defaults)');
  } else {
    const skill = key.match(SKILL_KEY);
    if (eventKeys.includes(key)) {
      // An event (such as `summon`), listed in EVENT_FX.
    } else if (skill) {
      if (!classKeys.includes(skill[1]))
        errors.push(`sp: no class ${skill[1]}`);
    } else if (!CARD_KEY.test(key) || !cardExists(key)) {
      errors.push(`sp: no card or skill "${key}"`);
    }
  }

  // The s_ params, checked against the fields' types.
  const given = new Map();
  for (const [param, raw] of params) {
    if (!param.startsWith('s_')) continue;
    const field = param.slice(2);
    if (!defaults.has(field)) {
      errors.push(`${param}: no such field in SPELL_FX_DEFAULTS`);
      continue;
    }
    const kind = typeof defaults.get(field);
    if (kind === 'boolean') {
      if (raw !== '0' && raw !== '1') {
        errors.push(`${param}: expected 0 or 1, got "${raw}"`);
        continue;
      }
      given.set(field, raw === '1');
    } else if (choices.has(field)) {
      if (!choices.get(field).includes(raw)) {
        errors.push(
          `${param}: expected one of ${choices.get(field).join(', ')}, got "${raw}"`,
        );
        continue;
      }
      given.set(field, raw);
    } else if (kind === 'string') {
      if (!/^[0-9a-f]{6}$/i.test(raw)) {
        errors.push(`${param}: expected a 6-digit hex colour, got "${raw}"`);
        continue;
      }
      given.set(field, raw.toLowerCase());
    } else if (raw === '' || Number.isNaN(+raw)) {
      errors.push(`${param}: expected a number, got "${raw}"`);
    } else {
      given.set(field, +raw);
    }
  }

  const base = params.get('e');
  if (base !== null && !kinds.includes(base)) {
    errors.push(`e: expected one of ${kinds.join(', ')}, got "${base}"`);
  }
  if (errors.length) return { errors, changes, tune: tuneSrc, fx: fxSrc };

  let tune = tuneSrc;
  let fx = fxSrc;

  if (isDefaults) {
    let block = findBlock(tuneSrc, 'SPELL_FX_DEFAULTS');
    let text = block.body;
    for (const [field, value] of given) {
      const old = defaults.get(field);
      if (old === value) continue;
      changes.push(
        `default ${field}: ${formatValue(old)} -> ${formatValue(value)}`,
      );
      text = text.replace(
        new RegExp(`^(\\s+${field}:\\s*).+?(,?)$`, 'm'),
        `$1${formatValue(value)}$2`,
      );
    }
    tune =
      tuneSrc.slice(0, block.open + 1) + text + tuneSrc.slice(block.close - 3);
    return { errors, changes, tune, fx };
  }

  // This spell's variant: the old entry with the URL over it, minus anything
  // that equals the default.
  const variants = parseVariants(findBlock(tuneSrc, 'SPELL_FX_VARIANTS').body);
  const before = new Map(variants.get(key) || []);
  const after = new Map(before);
  for (const [field, value] of given) after.set(field, value);
  for (const [field, value] of [...after]) {
    if (defaults.get(field) === value) after.delete(field);
  }
  for (const [field, value] of after) {
    if (before.get(field) !== value) {
      const old = before.has(field)
        ? formatValue(before.get(field))
        : 'default';
      changes.push(`${key} ${field}: ${old} -> ${formatValue(value)}`);
    }
  }
  for (const field of before.keys()) {
    if (!after.has(field)) changes.push(`${key} ${field}: back to default`);
  }
  if (after.size) variants.set(key, after);
  else variants.delete(key);
  tune = replaceBlock(
    tuneSrc,
    'SPELL_FX_VARIANTS',
    formatVariants(variants, order),
  );

  // The base effect assignment.
  if (base !== null) {
    const name = eventKeys.includes(key)
      ? 'EVENT_FX'
      : SKILL_KEY.test(key)
        ? 'SKILL_FX'
        : 'CARD_FX';
    const assigned = parseFlat(findBlock(fxSrc, name).body);
    const old = assigned.get(key);
    const next = base === DEFAULT_BASE && name === 'CARD_FX' ? undefined : base;
    if (old !== next) {
      changes.push(`${name} ${key}: ${old || 'none'} -> ${next || 'none'}`);
      if (next) assigned.set(key, next);
      else assigned.delete(key);
      fx = replaceBlock(fxSrc, name, formatAssignments(assigned));
    }
  }
  return { errors, changes, tune, fx };
};

const main = () => {
  const args = process.argv.slice(2);
  const isDry = args.includes('--dry');
  const isDefaults = args.includes('--defaults');
  const url = args.find((arg) => !arg.startsWith('--'));
  if (!url) {
    console.error('Usage: npm run spell -- [--dry] [--defaults] "<url>"');
    process.exit(1);
  }
  const classSrc = fs.readFileSync(CLASSES_FILE, 'utf8');
  const classKeys = [
    ...classSrc.match(/CLASS_KEYS = \[([^\]]+)\]/)[1].matchAll(/'(\w+)'/g),
  ].map((m) => m[1]);
  let result;
  try {
    result = plan({
      url,
      isDefaults,
      tuneSrc: fs.readFileSync(TUNE_FILE, 'utf8'),
      fxSrc: fs.readFileSync(FX_FILE, 'utf8'),
      classKeys,
      cardExists: hasCard,
    });
  } catch (error) {
    console.error(`Not a valid URL: ${url} (${error.message})`);
    process.exit(1);
  }
  if (result.errors.length) {
    console.error('Nothing written:\n  ' + result.errors.join('\n  '));
    process.exit(1);
  }
  if (!result.changes.length) {
    console.log('Already matches the saved look, nothing to change.');
    return;
  }
  console.log(
    (isDry ? 'Would change:\n  ' : 'Changed:\n  ') +
      result.changes.join('\n  '),
  );
  if (isDry) return;
  fs.writeFileSync(TUNE_FILE, result.tune);
  fs.writeFileSync(FX_FILE, result.fx);
  execSync(`npx prettier --write "${TUNE_FILE}" "${FX_FILE}"`, {
    stdio: 'ignore',
  });
};

module.exports = { plan };
if (require.main === module) main();
