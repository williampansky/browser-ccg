// Rewrites the Giants, the keyword-pile 8-drop, the timer card and a few exact effects (balance/PRIME-DISTANCE.md) in Airtable.
// Usage: node balance/airtable/prime-giants.js [--dry]
const a = require('./api.js');
const dry = process.argv.includes('--dry');
const changes = {
  PRIME_085: { text: 'Costs 1 less for each minion<br>\nthat has died this game (max 6)', mechanics: ['EVENT'] },
  PRIME_086: { text: 'Costs 1 less for each card you<br>\nplayed this turn and last (max 6)', mechanics: ['EVENT'] },
  PRIME_247: { cost: 12, text: 'Costs 1 less for each point<br>\nof %ARMOR% you have lost', mechanics: ['COST'] },
  PRIME_214: { attack: 5, health: 5, text: '<strong>%BULWARK%, %BUBBLE%</strong><br>\nYour other minions have<br>\n<strong>%RUSH%</strong>', mechanics: ['BULWARK', 'BUBBLE'] },
  PRIME_107: { text: 'While this is on a board,<br>\nyour opponent\'s turns last<br>\nonly 30 seconds' },
  PRIME_228: { cost: 6, text: '%DESTROY% all minions with 4 or<br>\nmore Attack, then both<br>\nplayers draw a card' },
  PRIME_078: { text: 'At the start of your next<br>\nturn, deal 4 damage to ALL<br>\nminions, then this dies' },
  PRIME_105: { numberPrimary: 18, text: '<strong>%ON_PLAY%:</strong> Set both<br>\nheroes\' Health to 18' },
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
  console.log('done');
})();
