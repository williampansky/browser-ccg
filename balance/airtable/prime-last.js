// The last PRIME rewrites: the Sprite tribe, temporary control, and a few others (balance/PRIME-DISTANCE.md). Adds the PRIME_169a weapon token.
// Usage: node balance/airtable/prime-last.js [--dry]
const a = require('./api.js');
const dry = process.argv.includes('--dry');
const changes = {
  PRIME_080: { mechanics: ['EVENT', 'SUMMON'], text: 'Whenever you %SUMMON% a %RACE_SPRITE%,<br>\ngive it +2 Attack this turn<br>\nand <strong>%RUSH%</strong>' },
  PRIME_044: { entourage: '', mechanics: ['EVENT'], text: 'Gain +1/+1 whenever<br>\na %RACE_SPRITE% dies' },
  PRIME_077: { text: '%DESTROY% a friendly %RACE_SPRITE%<br>\nand gain its stats' },
  PRIME_058: { mechanics: ['BUFF'], text: 'Give your other %RACE_SPRITE%s<br>\n+1/+1 and <strong>%BUBBLE%</strong>' },
  PRIME_064: { text: 'Gain +1/+1 for every<br />\ncard your opponent plays' },
  PRIME_169: { text: '<strong>%BUBBLE%, %BULWARK%</strong><br>\n<strong>%ON_DEATH%:</strong> Gain 5 %ARMOR%<br>\nand equip a 3/2 Mace' },
  PRIME_137: { text: '<strong>%BOON%</strong> a friendly minion:<br>\n+2 Attack and <strong>%IMMUNE%</strong><br>\nthis turn' },
  PRIME_196: { cost: 1, text: 'The next spell you play this turn<br>\ncosts 2 less; draw a card' },
  PRIME_184: { attack: 5, health: 7, text: '<strong>%BOON%:</strong> Your spells deal<br>\n+1 damage and heal for +1' },
  PRIME_063: { text: '<strong>%ON_PLAY%:</strong> Take control of an enemy<br>\nminion with 2 or less Attack<br>\nuntil the end of this turn' },
  PRIME_179: { text: 'Gain control of an enemy minion<br>\nwith 3 or less Attack until the<br>\nend of this turn; it can attack' },
  PRIME_183: { text: '<strong>%ON_PLAY%:</strong> Take control of an<br>\nenemy minion with 2 or less<br>\nAttack for 2 turns' },
};
(async () => {
  const s = await a.schema();
  const table = s.tables.find((t) => t.name === 'CARDS');
  const recs = await a.allRecords(table.id);
  const byId = new Map(recs.map((r) => [r.fields.id, r]));
  const updates = Object.entries(changes).map(([id, ch]) => {
    const r = byId.get(id);
    if (!r) throw new Error('no record ' + id);
    return { id: r.id, fields: ch };
  });
  console.log(dry ? 'DRY RUN' : 'updating', updates.length, 'records');
  if (dry) return;
  for (let i = 0; i < updates.length; i += 10) {
    await a.call('PATCH', `/${a.BASE}/${table.id}`, { records: updates.slice(i, i + 10), typecast: true });
  }
  if (!byId.has('PRIME_169a')) {
    await a.call('POST', `/${a.BASE}/${table.id}`, {
      fields: { id: 'PRIME_169a', name: 'Mace of the Shattered Mirror', set: 'PRIME', type: 'WEAPON', rarity: 'COMMON', cardClass: 'NONE', cost: 2, attack: 3, health: 2, isEntourage: true },
      typecast: true,
    });
  }
  console.log('done');
})();
