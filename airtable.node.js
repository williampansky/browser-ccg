/**
 * Pulls the card database from Airtable into `data/*.json`.   Usage: `npm run airtable`
 *
 * Needs AIRTABLE_API_KEY and AIRTABLE_BASE_ID in ./.env.local (read access is enough).
 * Reads the tables CARDS, HEROES, ABILITIES, MECHANICS and CONSTANTS and writes core, prime, entourage, game,
 * heroes, abilities, mechanics and constants as JSON in the shape the engine loads: single-select values get their
 * `%SYMBOL%` wrapping back (`MINION` -> `%TYPE_MINION%`); card `text` already carries its own `%TOKEN%`s.
 * Fetches every table first and writes only if all succeed and none is empty, so a failed pull never clobbers data.
 */
const fs = require('fs');

const OUT_DIR = './data';
for (const line of fs.readFileSync('./.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
}
const { AIRTABLE_API_KEY: KEY, AIRTABLE_BASE_ID: BASE } = process.env;
if (!KEY || !BASE) throw new Error('AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set in ./.env.local');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchAll(table) {
  const out = [];
  let offset;
  do {
    const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?pageSize=100${offset ? `&offset=${offset}` : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${KEY}` } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${table}: ${res.status} ${JSON.stringify(json.error || json)}`);
    out.push(...json.records.map((r) => r.fields));
    offset = json.offset;
    await sleep(230); // under 5 requests/second
  } while (offset);
  return out;
}

const P = (s) => (s === undefined ? undefined : `%${s}%`);
const SETS = { GAME: '%SET_001%', CORE: '%SET_002%', PRIME: '%SET_003%' };
const drop = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

const card = (f, isEntourage) =>
  drop({
    id: f.id, name: f.name, set: SETS[f.set], type: P('TYPE_' + f.type), rarity: P('RARITY_' + f.rarity),
    cardClass: f.cardClass && `0 %CLASS_${f.cardClass}%`, race: f.race && P('RACE_' + f.race),
    cost: f.cost, attack: f.attack, health: f.health, text: f.text, mechanics: f.mechanics && f.mechanics.map(P),
    numberPrimary: f.numberPrimary, numberSecondary: f.numberSecondary, numberRandom: f.numberRandom, numberOvercharge: f.numberOvercharge,
    playType: f.playType, playContext: f.playContext && P(f.playContext), targetingArrowText: f.targetingText,
    collectible: f.collectible ?? false, active: f.active ?? false, elite: f.elite, entourage: f.entourage,
    flavor: f.flavor, howToEarn: f.howToEarn, howToEarnGolden: f.howToEarnGolden, artistName: f.artistName,
    artistUrl: f.artistUrl, description: f.description, isEntourage: isEntourage ? true : undefined,
  });

(async () => {
  const names = ['CARDS', 'HEROES', 'ABILITIES', 'MECHANICS', 'CONSTANTS'];
  const t = {};
  for (const n of names) {
    process.stdout.write(`Fetching ${n} ... `);
    t[n] = await fetchAll(n);
    if (t[n].length === 0) throw new Error(`${n} came back empty; nothing written`);
    console.log(`${t[n].length} rows`);
  }
  const cards = t.CARDS;
  const files = {
    core: cards.filter((c) => !c.isEntourage && c.set === 'CORE').map((c) => card(c)),
    prime: cards.filter((c) => !c.isEntourage && c.set === 'PRIME').map((c) => card(c)),
    entourage: cards.filter((c) => c.isEntourage).map((c) => card(c, true)),
    game: cards.filter((c) => !c.isEntourage && c.set === 'GAME').map((c) => card(c)),
    heroes: t.HEROES.map((h) => drop({
      name: h.name, symbol: P(h.symbol), slug: h.slug, archetype: h.archetype, shortDescription: h.shortDescription, lore: h.lore,
      active: h.active, artistName: h.artistName, artistUrl: h.artistUrl, ability1: h.ability1, ability2: h.ability2, ability3: h.ability3,
    })),
    abilities: t.ABILITIES.map((a) => drop({
      name: a.name, playContext: P(a.playContext), type: P('TYPE_' + a.type), playType: a.playType, hero: P(a.heroSymbol),
      id: isNaN(a.id) ? a.id : Number(a.id), cost: a.cost, active: a.active, cooldown: a.cooldown, mechanics: a.mechanics && a.mechanics.map(P),
      text: a.text, numberPrimary: a.numberPrimary, numberSecondary: a.numberSecondary, numberRandom: a.numberRandom,
      targetingArrowText: a.targetingText, entourage: a.entourage, ultimate: a.ultimate, description: a.description,
    })),
    mechanics: t.MECHANICS.map((m) => drop({ symbol: P(m.symbol), description: m.description, shortDescription: m.shortDescription, name: m.name })),
    constants: t.CONSTANTS.map((c) => drop({ name: c.name, type: c.type, symbol: P(c.symbol), description: c.description })),
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [file, items] of Object.entries(files)) {
    fs.writeFileSync(`${OUT_DIR}/${file}.json`, JSON.stringify(items, null, 2) + '\n');
    console.log(`Wrote ${OUT_DIR}/${file}.json (${items.length})`);
  }
})().catch((e) => {
  console.error(`\nairtable failed: ${e.message}`);
  process.exit(1);
});
