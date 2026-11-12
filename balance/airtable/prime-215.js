// Playtest 2026-11-12: Mushroomer must not buff itself. Text now says "another friendly minion".
const a = require('./api.js');
(async () => {
  const s = await a.schema();
  const t = s.tables.find((x) => x.name === 'CARDS');
  const recs = await a.allRecords(t.id);
  const r = recs.find((x) => x.fields.id === 'PRIME_215');
  await a.call('PATCH', `/${a.BASE}/${t.id}/${r.id}`, { fields: { text: '<strong>%HIDDEN%.</strong> At the end of your turn, give another random friendly minion +1 HP' }, typecast: true });
  console.log('updated');
})();
