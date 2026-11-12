// Rewrites the Mystery cards (see balance/PRIME-DISTANCE.md) in the Airtable CARDS table and adds the PRIME_157a token.
// Usage: node balance/airtable/prime-mysteries.js [--dry]
const a = require('./api.js');
const dry = process.argv.includes('--dry');
const M = (rest) => `<strong>%MYSTERY%</strong><br>\n${rest}`;
const changes = {
  PRIME_143: { cost: 3, text: M("When your hero is attacked,<br>\ngain %ARMOR% equal to twice<br>\nthe attacker's Attack (min 4)"), mechanics: ['MYSTERY', 'ARMOR'] },
  PRIME_127: { cost: 2, text: M('The next minion to attack<br>\nyou is %DISABLE%d and loses 2 Attack'), mechanics: ['MYSTERY', 'DISABLE', 'DEBUFF'] },
  PRIME_152: { cost: 3, text: M("When an enemy casts a<br>\ntargeted spell, it hits a random<br>\nminion its caster controls instead"), mechanics: ['MYSTERY', 'EVENT'] },
  PRIME_126: { cost: 2, text: M("When an enemy minion attacks you,<br>\nyour weapon hits it first for<br>\nits Attack (needs a weapon)"), mechanics: ['MYSTERY', 'EVENT'] },
  PRIME_146: { cost: 2, text: M('When your opponent casts a<br>\nspell, add a copy to your hand'), mechanics: ['MYSTERY', 'ADD_CARD'] },
  PRIME_159: { cost: 2, text: M("When your opponent plays a minion,<br>\nhalve its Health (rounded up)<br>\nand %DISABLE% it"), mechanics: ['MYSTERY', 'DISABLE'] },
  PRIME_148: { cost: 3, text: M("When an enemy minion attacks your hero,<br>\nit takes damage equal to<br>\nyour hero's missing Health"), mechanics: ['MYSTERY'] },
  PRIME_129: { cost: 2, text: M('After your opponent plays a minion,<br>\ndeal damage equal to its<br>\nCost to it'), mechanics: ['MYSTERY'] },
  PRIME_158: { cost: 2, text: M('When your minion dies,<br>\n%RETURN% it to your hand;<br>\nit costs 1 less'), mechanics: ['MYSTERY', 'RETURN'] },
  PRIME_157: { cost: 1, text: M('When an enemy attacks,<br>\n%SUMMON% two 1/1 Mice with<br>\n%BULWARK%; the attack hits a Mouse'), mechanics: ['MYSTERY', 'EVENT', 'SUMMON'] },
  PRIME_156: { cost: 1, text: M('When your hero takes 5 or more<br>\ndamage in one hit, %HEAL% 5<br>\nand draw a card'), mechanics: ['MYSTERY', 'HEAL', 'DRAW_CARD'] },
  PRIME_132: { cost: 2, text: 'Reveal all %HIDDEN%s (they lose it and take 1 damage). %DESTROY% enemy\'s %MYSTERY% and draw a card if you did', mechanics: ['MYSTERY', 'DESTROY'] },
  PRIME_067: { text: "%ON_PLAY%: Take the<br>\nenemy's %MYSTERY%", mechanics: ['ON_PLAY', 'MYSTERY', 'STEAL'] },
};
const bare = (t) => t; // the Airtable table stores symbols bare in select fields, but text keeps %...% markup
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
  if (!byId.has('PRIME_157a')) {
    await a.call('POST', `/${a.BASE}/${table.id}`, {
      fields: { id: 'PRIME_157a', name: 'Doorway Mouse', set: 'PRIME', type: 'MINION', rarity: 'COMMON', cardClass: 'NONE', race: 'CREATURE', cost: 1, attack: 1, health: 1, mechanics: ['BULWARK'], isEntourage: true },
      typecast: true,
    });
  }
  console.log('done');
})();
