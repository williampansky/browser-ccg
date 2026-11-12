// Small Airtable edits for the third PRIME batch: Poisoned Imp and Bare Boned (distance audit), and the PRIME_100a token for Sellarus.
// Usage: node balance/airtable/prime-batch3.js [--dry]
const a = require('./api.js');
const dry = process.argv.includes('--dry');
const changes = {
  PRIME_060: { attack: 1, health: 3, mechanics: ['POISON', 'HIDDEN'], text: '<strong>%HIDDEN%</strong><br>\nTouch of Death' },
  PRIME_012: { attack: 2, health: 3 },
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
  await a.call('PATCH', `/${a.BASE}/${table.id}`, { records: updates, typecast: true });
  if (!byId.has('PRIME_100a')) {
    await a.call('POST', `/${a.BASE}/${table.id}`, {
      fields: { id: 'PRIME_100a', name: 'Cursed Spawn', set: 'PRIME', type: 'MINION', rarity: 'COMMON', cardClass: 'NONE', race: 'CREATURE', cost: 3, attack: 3, health: 3, isEntourage: true },
      typecast: true,
    });
  }
  console.log('done');
})();
