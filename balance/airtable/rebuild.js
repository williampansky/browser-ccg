// usage: node balance/airtable/rebuild.js rename|create|load|all
// Renames the old tables to "OLD <name>" (the API cannot delete tables), creates the new tables, loads rows.
const { call, schema, BASE } = require('./api');
const { build } = require('./build');
const T = (name, fields, description) => ({ name, fields, description });
const txt = (name) => ({ name, type: 'singleLineText' });
const long = (name) => ({ name, type: 'multilineText' });
const num = (name) => ({ name, type: 'number', options: { precision: 0 } });
const chk = (name) => ({ name, type: 'checkbox', options: { icon: 'check', color: 'greenBright' } });
const uniq = (a) => [...new Set(a.filter((x) => x !== undefined))];
const choices = (a) => ({ choices: uniq(a).map((name) => ({ name })) });
const sel = (name, a) => ({ name, type: 'singleSelect', options: choices(a) });
const multi = (name, a) => ({ name, type: 'multipleSelects', options: choices(a) });

function tables(b, heroesTableId) {
  const c = b.cards, a = b.abilities, mechNames = uniq([...b.mechanics.map((m) => m.symbol), ...c.flatMap((x) => x.mechanics || []), ...a.flatMap((x) => x.mechanics || [])]);
  return {
    MECHANICS: T('MECHANICS', [txt('name'), txt('symbol'), txt('shortDescription'), long('description')], 'Glossary of keywords and effects. `symbol` is what cards reference in `mechanics`.'),
    CONSTANTS: T('CONSTANTS', [txt('name'), txt('symbol'), sel('type', b.constants.map((x) => x.type)), long('description')], 'Rarities, sets, races and other symbols.'),
    HEROES: T('HEROES', [txt('name'), txt('symbol'), txt('slug'), sel('archetype', b.heroes.map((x) => x.archetype)), txt('shortDescription'), long('lore'), chk('active'), txt('artistName'), txt('artistUrl'), long('ability1'), long('ability2'), long('ability3')], 'Playable heroes. Their skills live in ABILITIES.'),
    ABILITIES: T('ABILITIES', [txt('key'), txt('name'), { name: 'hero', type: 'multipleRecordLinks', options: { linkedTableId: heroesTableId } }, txt('heroSymbol'), txt('id'), num('cost'), num('cooldown'), sel('type', a.map((x) => x.type)), sel('playType', a.map((x) => x.playType)), sel('playContext', a.map((x) => x.playContext)), long('text'), multi('mechanics', mechNames), num('numberPrimary'), num('numberSecondary'), num('numberRandom'), txt('targetingText'), txt('entourage'), chk('ultimate'), chk('active'), long('description')], 'Hero class skills.'),
    CARDS: T('CARDS', [
      txt('id'), txt('name'), sel('set', c.map((x) => x.set)), sel('type', c.map((x) => x.type)), sel('rarity', c.map((x) => x.rarity)),
      sel('cardClass', c.map((x) => x.cardClass)), sel('race', c.map((x) => x.race)), num('cost'), num('attack'), num('health'), long('text'), multi('mechanics', mechNames),
      num('numberPrimary'), num('numberSecondary'), num('numberRandom'), num('numberOvercharge'), sel('playType', c.map((x) => x.playType)), sel('playContext', c.map((x) => x.playContext)),
      txt('targetingText'), chk('collectible'), chk('active'), chk('elite'), txt('entourage'), chk('isEntourage'), long('flavor'), txt('howToEarn'), txt('howToEarnGolden'), txt('artistName'), txt('artistUrl'), long('description'),
      long('balanceNote'), txt('previous'),
    ], 'Every card from every set in one table. `isEntourage` marks summoned token cards; `health` is durability for weapons. `balanceNote`/`previous` record the 2026-11 balance pass.'),
  };
}

const clean = (row) => Object.fromEntries(Object.entries(row).filter(([k, v]) => !k.startsWith('_') && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)));
async function insert(tableId, rows) {
  const ids = [];
  for (let i = 0; i < rows.length; i += 10) {
    const j = await call('POST', `/${BASE}/${tableId}`, { typecast: true, records: rows.slice(i, i + 10).map((r) => ({ fields: clean(r) })) });
    ids.push(...j.records.map((r) => r.id));
  }
  return ids;
}

async function main(step) {
  let s = await schema();
  if (step === 'rename' || step === 'all') {
    for (const t of s.tables) if (!t.name.startsWith('OLD ')) { await call('PATCH', `/meta/bases/${BASE}/tables/${t.id}`, { name: `OLD ${t.name}` }); console.log('renamed', t.name); }
    s = await schema();
  }
  if (step === 'create' || step === 'all') {
    const b = build(); const made = {};
    let defs = tables(b, 'tblPLACEHOLDER');
    for (const name of ['MECHANICS', 'CONSTANTS', 'HEROES', 'ABILITIES', 'CARDS']) {
      if (name === 'ABILITIES') defs = tables(b, made.HEROES);
      const d = defs[name];
      const t = await call('POST', `/meta/bases/${BASE}/tables`, { name: d.name, description: d.description, fields: d.fields });
      made[name] = t.id; console.log('created', name, t.fields.length, 'fields');
    }
  }
  if (step === 'load' || step === 'all') {
    s = await schema(); const id = (n) => s.tables.find((t) => t.name === n).id; const b = build();
    await insert(id('MECHANICS'), b.mechanics); console.log('MECHANICS', b.mechanics.length);
    await insert(id('CONSTANTS'), b.constants); console.log('CONSTANTS', b.constants.length);
    const hIds = await insert(id('HEROES'), b.heroes); console.log('HEROES', b.heroes.length);
    const bySymbol = Object.fromEntries(b.heroes.map((h, i) => [h.symbol, hIds[i]]));
    await insert(id('ABILITIES'), b.abilities.map((a) => ({ ...a, hero: bySymbol[a.heroSymbol] ? [bySymbol[a.heroSymbol]] : undefined }))); console.log('ABILITIES', b.abilities.length);
    await insert(id('CARDS'), b.cards); console.log('CARDS', b.cards.length);
  }
}
main(process.argv[2] || 'all').catch((e) => { console.error(e.message); process.exit(1); });
