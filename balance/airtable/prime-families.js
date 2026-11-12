// Rewrites the choose-one, overload and enrage PRIME cards (see balance/PRIME-DISTANCE.md) in the Airtable CARDS table, and adds the PRIME_111c token.
// Usage: node balance/airtable/prime-families.js [--dry]
const a = require('./api.js');
const dry = process.argv.includes('--dry');
const co = (rest) => `<strong>%CHOOSE_ONE%:</strong><br>\n${rest}`;
const changes = {
  // Choose-one
  PRIME_111: { cost: 3, entourage: 'PRIME_111c', text: co('+1/+1 to your %RACE_CREATURE%s;<br>\nor %SUMMON% a 3/2 that has %RUSH%') },
  PRIME_112: { cost: 2, numberPrimary: 2, text: co('2 damage and gain 2 %ARMOR%;<br>\nor 1 damage and draw a card') },
  PRIME_113: { cost: 3, numberPrimary: 3, text: co('+3 Attack and %RUSH%;<br>\nor +3 Health, %BULWARK%<br>\nand heal your hero 3') },
  PRIME_120: { cost: 6, text: co('4 damage to a minion and<br>\n1 to its neighbours; or 1 to all<br>\nenemy minions and %DISABLE% them') },
  PRIME_121: { cost: 5, text: co('+1 %ENERGY_CRYSTAL% and draw a card;<br>\nor draw 2 cards that cost 1 less') },
  PRIME_123: { text: co('Draw 2 cards and take 2 damage;<br>\nor heal your hero 5 and give a<br>\nfriendly minion %BUBBLE%') },
  PRIME_115: { attack: 5, health: 3, text: co('Gain %RUSH% and +1 Attack;<br>\nor +3 Health and %BULWARK%') },
  PRIME_124: { attack: 4, health: 6, text: co('+3 Attack and %RUSH%; or +3 Health,<br>\n%BULWARK% and heal your hero 3') },
  PRIME_119: { attack: 2, health: 3, text: co('2 damage to a damaged minion;<br>\nor %SILENCE% a minion and give it -1 Attack') },
  // Overload
  PRIME_203: { cost: 2, text: 'Deal 3 damage to a minion;<br>\ndraw a card if it dies<br>\n<strong>%OVERLOAD% (1)</strong>' },
  PRIME_208: { numberPrimary: 4, text: 'Deal 4 damage to a minion<br>\nand 2 to its neighbours<br>\n<strong>%OVERLOAD% (2)</strong>' },
  PRIME_209: { numberOvercharge: 2, text: 'Deal 2 damage to all enemy minions,<br>\nthen %DISABLE% any left with 1 Health<br>\n<strong>%OVERLOAD% (2)</strong>' },
  PRIME_202: { numberPrimary: 3, numberRandom: 1, numberOvercharge: 1, text: 'Deal 3 damage to a<br>\n%RANDOM% enemy<br>\n<strong>%OVERLOAD% (1)</strong>' },
  PRIME_204: { attack: 2, health: 2, text: 'Disables the enemy it hits<br>\n<strong>%OVERLOAD% (1)</strong>' },
  PRIME_200: { attack: 2, health: 1, numberOvercharge: 1, text: '<strong>%DOUBLE_ATTACK%</strong><br>\nDies at the end of your turn if<br>\nit attacked twice <strong>%OVERLOAD% (1)</strong>' },
  PRIME_213: { attack: 6, health: 7, text: '<strong>%BULWARK%</strong> <strong>%OVERLOAD% (3)</strong><br>\nWhen attacked, heal your hero 1' },
  PRIME_205: { text: 'Whenever any player plays an<br>\n<strong>%OVERLOAD%</strong> card, gain +1/+1' },
  // Enrage
  PRIME_009: { attack: 1, health: 4, numberPrimary: 2, text: '+2 Attack and %RUSH%<br>\nif damaged' },
  PRIME_035: { attack: 3, health: 6, text: '+1 Attack for each<br>\ndamage taken (max +4)' },
  PRIME_041: { attack: 1, health: 2, numberPrimary: 1, text: 'Gains +1 Attack<br>\neach time it is damaged' },
  PRIME_024: { health: 4, text: '<strong>%BULWARK%</strong><br>\nHeals 1 each time<br>\nit is damaged' },
  PRIME_244: { attack: 4, health: 8, text: '<strong>%RUSH%</strong><br>\n%DOUBLE_ATTACK% while damaged' },
  PRIME_022: { text: '%DOUBLE_ATTACK% on turns<br>\nyour hero took damage' },
  PRIME_006: { attack: 1, health: 2, text: 'While you have a weapon:<br>\n+1 Attack and <strong>%RUSH%</strong>' },
};
(async () => {
  const s = await a.schema();
  const table = s.tables.find((t) => t.name === 'CARDS');
  const recs = await a.allRecords(table.id);
  const byId = new Map(recs.map((r) => [r.fields.id, r]));
  const updates = [];
  for (const [id, ch] of Object.entries(changes)) {
    const r = byId.get(id);
    if (!r) throw new Error('no record ' + id);
    updates.push({ id: r.id, fields: ch });
  }
  console.log(dry ? 'DRY RUN' : 'updating', updates.length, 'records');
  if (dry) return;
  for (let i = 0; i < updates.length; i += 10) {
    await a.call('PATCH', `/${a.BASE}/${table.id}`, { records: updates.slice(i, i + 10), typecast: true });
  }
  if (!byId.has('PRIME_111c')) {
    await a.call('POST', `/${a.BASE}/${table.id}`, {
      fields: { id: 'PRIME_111c', name: 'Wild Cub', set: 'PRIME', type: 'MINION', rarity: 'COMMON', cardClass: 'NONE', race: 'CREATURE', cost: 2, attack: 3, health: 2, isEntourage: true },
      typecast: true,
    });
  }
  console.log('done');
})();
