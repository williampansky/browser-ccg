// Tome of Spells gets its distance twist (balance/PRIME-DISTANCE.md): the random spell costs 3 or less.
// Usage: node balance/airtable/prime-pool.js [--dry]
const a = require('./api.js');
const dry = process.argv.includes('--dry');
(async () => {
  const s = await a.schema();
  const table = s.tables.find((t) => t.name === 'CARDS');
  const recs = await a.allRecords(table.id);
  const r = recs.find((x) => x.fields.id === 'PRIME_140');
  if (!r) throw new Error('no PRIME_140');
  const fields = { text: 'Add a %RANDOM% spell that<br>\ncosts 3 or less to your hand', numberPrimary: 3 };
  console.log(dry ? 'DRY RUN' : 'updating PRIME_140');
  if (!dry) await a.call('PATCH', `/${a.BASE}/${table.id}/${r.id}`, { fields, typecast: true });
})();
