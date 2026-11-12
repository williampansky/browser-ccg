// Builds the rows for the new Airtable tables from data/*.json + the chosen balance proposals. Pure, no network.
const fs = require('fs');
const D = (f) => JSON.parse(fs.readFileSync(`data/${f}.json`, 'utf8'));
const strip = (s) => (typeof s === 'string' ? s.replace(/^%|%$/g, '') : s);

// --- balance scope: proposals 1-3, 4 and 5 minus the unverified / probe entries (see balance/README.md) ---
const SKIP = {
  2: ['CORE_007'], // author decided to keep NO_ATTACK
  4: ['CORE_049', 'CORE_068', 'CORE_084', 'CORE_114', 'CORE_074', 'CORE_123', 'CORE_043', 'CORE_094', 'CORE_113', 'CORE_087'],
  5: ['CORE_068', 'CORE_096', 'CORE_049', 'CORE_113'],
};
function applyBalance(cards) {
  const byId = Object.fromEntries(cards.map((c) => [c.id, JSON.parse(JSON.stringify(c))]));
  const before = Object.fromEntries(cards.map((c) => [c.id, c]));
  const notes = {};
  for (const n of [1, 2, 3, 4, 5]) {
    const p = JSON.parse(fs.readFileSync(`balance/proposal-${n}.json`, 'utf8'));
    for (const [id, ch] of Object.entries(p)) {
      if ((SKIP[n] || []).includes(id)) continue;
      for (const [k, v] of Object.entries(ch)) if (k !== 'why') byId[id][k] = v;
      (notes[id] ??= []).push(ch.why);
    }
  }
  // keep hard-coded numbers in text / targeting text in step with a changed numberPrimary (unless the patch rewrote the text)
  for (const id of Object.keys(notes)) {
    const o = before[id], n = byId[id];
    if (o.numberPrimary !== n.numberPrimary && o.text === n.text && o.numberPrimary !== undefined) {
      const re = new RegExp(`\\b${o.numberPrimary}\\b`);
      for (const f of ['text', 'targetingArrowText']) if (n[f] && re.test(n[f])) n[f] = n[f].replace(re, String(n.numberPrimary));
    }
    if (o.numberPrimary !== n.numberPrimary && o.text !== n.text && n.targetingArrowText && o.numberPrimary !== undefined) {
      const re = new RegExp(`\\b${o.numberPrimary}\\b`);
      if (re.test(n.targetingArrowText)) n.targetingArrowText = n.targetingArrowText.replace(re, String(n.numberPrimary));
    }
  }
  const FIELDS = ['cost', 'attack', 'health', 'numberPrimary', 'numberSecondary', 'text', 'targetingArrowText', 'mechanics'];
  const meta = {};
  for (const id of Object.keys(notes)) {
    const diffs = FIELDS.filter((k) => JSON.stringify(before[id][k]) !== JSON.stringify(byId[id][k]))
      .map((k) => (k === 'text' || k === 'targetingArrowText' || k === 'mechanics' ? `${k} changed` : `${k} ${before[id][k] ?? '-'} -> ${byId[id][k]}`));
    if (diffs.length === 0) continue;
    meta[id] = { previous: diffs.join('; '), note: notes[id].join(' | ') };
  }
  return { cards: Object.values(byId), meta };
}

const SET = { '%SET_001%': 'GAME', '%SET_002%': 'CORE', '%SET_003%': 'PRIME' };
function cardRow(c, source, meta) {
  const m = meta[c.id] || {};
  return {
    id: c.id, name: c.name, set: SET[c.set], type: strip(c.type).replace('TYPE_', ''), rarity: strip(c.rarity).replace('RARITY_', ''),
    cardClass: c.cardClass === undefined ? undefined : strip(c.cardClass.replace(/^\d+ /, '')).replace('CLASS_', ''),
    race: c.race === undefined ? undefined : strip(c.race).replace('RACE_', ''),
    cost: c.cost, attack: c.attack, health: c.health, text: c.text,
    mechanics: c.mechanics && c.mechanics.map(strip),
    numberPrimary: c.numberPrimary, numberSecondary: c.numberSecondary,
    numberRandom: c.numberRNG ?? c.numberRandom, numberOvercharge: c.numberOvercharge,
    playType: c.playType, playContext: c.playContext && strip(c.playContext), targetingText: c.targetingArrowText,
    collectible: c.collectible, active: c.active, elite: c.elite, entourage: c.entourage,
    isEntourage: source === 'entourage' ? true : undefined,
    flavor: c.flavor, howToEarn: c.howToEarn, howToEarnGolden: c.howToEarnGolden,
    artistName: c.artistName, artistUrl: c.artistUrl, description: c.description,
    balanceNote: m.note, previous: m.previous,
    _legacyRngField: c.numberRNG !== undefined ? 'numberRNG' : undefined, // only used by the round-trip check
  };
}

function build() {
  const { cards: core, meta } = applyBalance(D('core'));
  const rows = [
    ...core.map((c) => cardRow(c, 'core', meta)),
    ...D('prime').map((c) => cardRow(c, 'prime', {})),
    ...D('entourage').map((c) => cardRow(c, 'entourage', {})),
    ...D('game').map((c) => cardRow(c, 'game', {})),
  ];
  const heroes = D('heroes').map((h) => ({
    name: h.name, symbol: strip(h.symbol), slug: h.slug, archetype: h.archetype, shortDescription: h.shortDescription, lore: h.lore,
    active: h.active, artistName: h.artistName, artistUrl: h.artistUrl, ability1: h.ability1, ability2: h.ability2, ability3: h.ability3,
  }));
  const abilities = D('abilities').map((a) => ({
    key: `${strip(a.hero).replace('HERO_', '')}-${a.id}`, name: a.name, heroSymbol: strip(a.hero), id: String(a.id), cost: a.cost,
    cooldown: a.cooldown === undefined ? undefined : Number(a.cooldown), type: strip(a.type).replace('TYPE_', ''), playType: a.playType,
    playContext: strip(a.playContext), text: a.text, mechanics: a.mechanics && a.mechanics.map(strip), numberPrimary: a.numberPrimary,
    numberSecondary: a.numberSecondary, numberRandom: a.numberRNG ?? a.numberRandom, targetingText: a.targetingArrowText,
    entourage: a.entourage, ultimate: a.ultimate, active: a.active, description: a.description,
  }));
  const mech = D('mechanics').map((m) => ({ name: m.name, symbol: strip(m.symbol), shortDescription: m.shortDescription, description: m.description }));
  const consts = D('constants').map((c) => ({ name: c.name, symbol: strip(c.symbol), type: c.type, description: c.description }));
  return { cards: rows, heroes, abilities, mechanics: mech, constants: consts, changed: Object.keys(meta).length };
}
module.exports = { build, strip };
if (require.main === module) {
  const b = build();
  console.log(Object.fromEntries(Object.entries(b).map(([k, v]) => [k, Array.isArray(v) ? v.length : v])));
  const dup = {}; b.abilities.forEach((a) => (dup[a.key] = (dup[a.key] || 0) + 1)); console.log('ability key dups', Object.values(dup).filter((n) => n > 1).length);
  console.log('hero symbols w/o hero', [...new Set(b.abilities.map((a) => a.heroSymbol))].filter((s) => !b.heroes.find((h) => h.symbol === s)));
  console.log(JSON.stringify(b.cards.find((c) => c.id === 'CORE_112')));
}
