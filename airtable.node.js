/**
 * Pulls the card database from Airtable into `data/*.json`.
 * Usage: `npm run airtable`
 *
 * Needs AIRTABLE_API_KEY and AIRTABLE_BASE_ID in ./.env.local (read access is
 * enough).
 *
 * Reads the tables CARDS, HEROES, CLASSES, SKILLS, MECHANICS and CONSTANTS
 * and writes core, prime, entourage, game, heroes, classes, skills,
 * mechanics and constants as JSON in the shape the engine loads:
 * single-select values get their `%SYMBOL%` wrapping back
 * (`MINION` -> `%TYPE_MINION%`); card `text` already carries its own
 * `%TOKEN%`s.
 *
 * Fetches every table first and writes only if all succeed and none is empty,
 * so a failed pull never clobbers data.
 */
const fs = require('fs');

const OUT_DIR = './data';
const ENV_FILE = './.env.local';
const TABLE_NAMES = [
  'CARDS',
  'HEROES',
  'CLASSES',
  'SKILLS',
  'MECHANICS',
  'CONSTANTS',
];
const PAGE_SIZE = 100;
// Airtable allows 5 requests per second; stay under it.
const REQUEST_GAP_MS = 230;
const JSON_INDENT = 2;
const SETS = { GAME: '%SET_001%', CORE: '%SET_002%', PRIME: '%SET_003%' };

for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);

  if (match && !(match[1] in process.env)) {
    const [, key, value] = match;
    process.env[key] = value.trim();
  }
}

const { AIRTABLE_API_KEY: apiKey, AIRTABLE_BASE_ID: baseId } = process.env;

if (!apiKey || !baseId) {
  throw new Error(
    'AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in ./.env.local',
  );
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const wrapSymbol = (value) => (value === undefined ? undefined : `%${value}%`);

const dropUndefined = (record) => {
  const entries = Object.entries(record);

  return Object.fromEntries(entries.filter(([, value]) => value !== undefined));
};

const toNumberIfNumeric = (value) => (isNaN(value) ? value : Number(value));

const fetchAll = async (table) => {
  const records = [];
  let offset;

  do {
    const pageParam = offset ? `&offset=${offset}` : '';
    const path = `${baseId}/${encodeURIComponent(table)}`;
    const url = `https://api.airtable.com/v0/${path}?pageSize=${PAGE_SIZE}${pageParam}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = JSON.stringify(body.error || body);

      throw new Error(`${table}: ${response.status} ${detail}`);
    }

    records.push(...body.records);
    offset = body.offset;
    await sleep(REQUEST_GAP_MS);
  } while (offset);

  return records;
};

/**
 * A card's class as the engine reads it: `0 %CLASS_FIGHTER%`. `cardClass` is
 * a link to the CLASSES table, so Airtable sends the linked record's id and the
 * symbol is looked up; an older single-select value (`NONE`) still works.
 */
const toCardClass = (value, classSymbolById) => {
  const symbol = Array.isArray(value) ? classSymbolById[value[0]] : value;

  if (!symbol) return undefined;

  const name = symbol.startsWith('CLASS_') ? symbol : `CLASS_${symbol}`;

  return `0 %${name}%`;
};

const toCard = (fields, classSymbolById, isEntourage) => {
  return dropUndefined({
    id: fields.id,
    name: fields.name,
    set: SETS[fields.set],
    type: wrapSymbol('TYPE_' + fields.type),
    rarity: wrapSymbol('RARITY_' + fields.rarity),
    cardClass: toCardClass(fields.cardClass, classSymbolById),
    race: fields.race && wrapSymbol('RACE_' + fields.race),
    cost: fields.cost,
    attack: fields.attack,
    health: fields.health,
    text: fields.text,
    mechanics: fields.mechanics && fields.mechanics.map(wrapSymbol),
    numberPrimary: fields.numberPrimary,
    numberSecondary: fields.numberSecondary,
    numberRandom: fields.numberRandom,
    numberOvercharge: fields.numberOvercharge,
    playType: fields.playType,
    playContext: fields.playContext && wrapSymbol(fields.playContext),
    targetingArrowText: fields.targetingText,
    collectible: fields.collectible ?? false,
    active: fields.active ?? false,
    elite: fields.elite,
    entourage: fields.entourage,
    flavor: fields.flavor,
    howToEarn: fields.howToEarn,
    howToEarnGolden: fields.howToEarnGolden,
    artistName: fields.artistName,
    artistUrl: fields.artistUrl,
    artStatus: fields.artStatus,
    description: fields.description,
    isEntourage: isEntourage ? true : undefined,
  });
};

const toHero = (fields) => {
  return dropUndefined({
    name: fields.name,
    symbol: wrapSymbol(fields.symbol),
    slug: fields.slug,
    archetype: fields.archetype,
    class: wrapSymbol(fields.class),
    shortDescription: fields.shortDescription,
    lore: fields.lore,
    active: fields.active,
    artistName: fields.artistName,
    artistUrl: fields.artistUrl,
  });
};

const toClass = (fields) => {
  return dropUndefined({
    name: fields.name,
    symbol: wrapSymbol(fields.symbol),
    shortDescription: fields.shortDescription,
    active: fields.active,
  });
};

// `class` is a link: Airtable sends the linked record's id, so the symbol is
// looked up from the CLASSES table.
const toSkill = (fields, classSymbolById) => {
  const [classId] = fields.class || [];

  return dropUndefined({
    name: fields.name,
    playContext: wrapSymbol(fields.playContext),
    type: wrapSymbol('TYPE_' + fields.type),
    playType: fields.playType,
    class: wrapSymbol(classSymbolById[classId]),
    id: toNumberIfNumeric(fields.id),
    cost: fields.cost,
    active: fields.active,
    cooldown: fields.cooldown,
    mechanics: fields.mechanics && fields.mechanics.map(wrapSymbol),
    text: fields.text,
    numberPrimary: fields.numberPrimary,
    numberSecondary: fields.numberSecondary,
    numberRandom: fields.numberRandom,
    rarity: fields.rarity ? wrapSymbol('RARITY_' + fields.rarity) : undefined,
    targetingArrowText: fields.targetingText,
    entourage: fields.entourage,
    ultimate: fields.ultimate,
    description: fields.description,
  });
};

const toMechanic = (fields) => {
  return dropUndefined({
    symbol: wrapSymbol(fields.symbol),
    description: fields.description,
    shortDescription: fields.shortDescription,
    name: fields.name,
  });
};

const toConstant = (fields) => {
  return dropUndefined({
    name: fields.name,
    type: fields.type,
    symbol: wrapSymbol(fields.symbol),
    description: fields.description,
  });
};

const isInSet = (setName) => {
  return (fields) => !fields.isEntourage && fields.set === setName;
};

const pull = async () => {
  const tables = {};

  for (const name of TABLE_NAMES) {
    process.stdout.write(`Fetching ${name} ... `);
    tables[name] = await fetchAll(name);

    if (tables[name].length === 0) {
      throw new Error(`${name} came back empty; nothing written`);
    }

    console.log(`${tables[name].length} rows`);
  }

  const rows = (name) => tables[name].map((record) => record.fields);
  const classSymbolById = Object.fromEntries(
    tables.CLASSES.map((record) => [record.id, record.fields.symbol]),
  );
  const cards = rows('CARDS');
  const files = {
    core: cards
      .filter(isInSet('CORE'))
      .map((fields) => toCard(fields, classSymbolById)),
    prime: cards
      .filter(isInSet('PRIME'))
      .map((fields) => toCard(fields, classSymbolById)),
    entourage: cards
      .filter((fields) => fields.isEntourage)
      .map((fields) => toCard(fields, classSymbolById, true)),
    game: cards
      .filter(isInSet('GAME'))
      .map((fields) => toCard(fields, classSymbolById)),
    heroes: rows('HEROES').map(toHero),
    classes: rows('CLASSES').map(toClass),
    skills: rows('SKILLS').map((fields) => toSkill(fields, classSymbolById)),
    mechanics: rows('MECHANICS').map(toMechanic),
    constants: rows('CONSTANTS').map(toConstant),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const [file, items] of Object.entries(files)) {
    const json = JSON.stringify(items, null, JSON_INDENT);

    fs.writeFileSync(`${OUT_DIR}/${file}.json`, json + '\n');
    console.log(`Wrote ${OUT_DIR}/${file}.json (${items.length})`);
  }
};

pull().catch((error) => {
  console.error(`\nairtable failed: ${error.message}`);
  process.exit(1);
});
