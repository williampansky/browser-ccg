// Rewrites the "exact body / exact warcry" PRIME cards (balance/PRIME-DISTANCE.md) in Airtable and adds the PRIME_224a token.
// Usage: node balance/airtable/prime-bodies.js [--dry]
const a = require('./api.js');
const dry = process.argv.includes('--dry');
const co = (rest) => `<strong>%CHOOSE_ONE%:</strong><br>\n${rest}`;
const changes = {
  PRIME_013: { attack: 1, health: 3 },
  PRIME_019: { text: '<strong>%ON_DEATH%:</strong> %SUMMON% a 2/1<br>\nWarrior Bot with <strong>%RUSH%</strong>' },
  PRIME_004: { text: '<strong>%ON_DEATH%:</strong> Deal 2 damage to a<br>\n%RANDOM% enemy minion, or the<br>\nenemy hero if there is none' },
  PRIME_007: { attack: 1, health: 3 },
  PRIME_040: { attack: 4, health: 4, text: '<strong>%DOUBLE_ATTACK%</strong><br>\nLoses it when damaged' },
  PRIME_017: { mechanics: ['ON_PLAY', 'CHOOSE_ONE', 'HEAL'], text: co('Heal a character 3;<br>\nor deal 1 damage to a character') },
  PRIME_020: { text: '%SILENCE% a minion with<br>\nCost 3 or less' },
  PRIME_032: { text: '%SILENCE% an enemy minion;<br>\ndraw a card if it had a<br>\nwarcry or a demise' },
  PRIME_048: { text: "Swap a minion's Attack and<br>\nHealth; it is %DISABLE%d" },
  PRIME_082: { attack: 4, health: 3, text: '%DESTROY% a minion with 6+<br>\nAttack that is damaged or<br>\nhas attacked this turn' },
  PRIME_095: { attack: 4, health: 5, mechanics: ['ON_PLAY', 'DESTROY', 'ARMOR'], text: "Destroy the enemy's weapon<br>\nand gain its Attack as %ARMOR%" },
  PRIME_161: { attack: 2, health: 3, text: "A minion's Attack is<br>\nhalved (rounded down)" },
  PRIME_028: { numberPrimary: 3, text: '<strong>%BOON%</strong> a minion with<br />\n+3 Attack this turn' },
  PRIME_002: { text: 'Give a friendly minion<br />\n+2 Attack this turn;<br />\nit takes 1 damage' },
  PRIME_224: { entourage: 'PRIME_224a', text: '<strong>%DESTROY%</strong> a minion and<br>\nsummon a 2/2 Husk for you', mechanics: ['DESTROY', 'SUMMON'] },
  PRIME_241: { text: 'Deal damage to a minion equal to<br>\nyour %ARMOR%, then lose half<br>\nof it (rounded up)' },
  PRIME_233: { text: '%BUFF% a damaged minion<br>\nwith +2/+4' },
  PRIME_185: { text: '%RETURN% a friendly minion to your hand;<br>\nit costs 1 less and has<br>\n<strong>%RUSH%</strong> when played', numberPrimary: 1 },
  PRIME_246: { text: '<strong>%ON_DEATH%:</strong> Swap your<br>\nweakest minion for the<br>\nenemy\'s strongest', mechanics: ['ON_DEATH', 'STEAL'] },
  PRIME_070: { text: '<strong>%BULWARK%</strong><br />\n<strong>%ON_DEATH%:</strong> Deal 2 damage<br />\nto all enemies; your minions<br />\nget <strong>%BUBBLE%</strong>', mechanics: ['BULWARK', 'ON_DEATH', 'AOE', 'BUBBLE'] },
  PRIME_176: { text: 'At the end of your turn, heal<br>\nyour most damaged minion 3<br>\nand your hero 1', mechanics: ['HEAL', 'ON_END'] },
  PRIME_237: { numberPrimary: 2, text: 'Gain 2 %ARMOR% whenever<br>\na friendly minion dies' },
  PRIME_043: { numberPrimary: 1, text: 'Whenever your characters<br>\nare healed, gain +1/+1' },
  PRIME_239: { text: 'Whenever an enemy minion<br>\ntakes damage, gain<br>\n+1 Attack this turn' },
  PRIME_049: { attack: 2, health: 2, mechanics: ['EVENT', 'SUMMON'], text: 'After you %SUMMON% a minion,<br>\ndeal 1 damage to a random<br>\nenemy minion' },
  PRIME_055: { attack: 2, health: 3, text: 'After you cast a spell,<br />\ndeal 1 damage to all<br />\nenemy minions' },
  PRIME_141: { text: 'Whenever you cast a spell,<br>\ngain +1 Attack this turn;<br>\ndraw a card at 4 Attack', mechanics: ['EVENT', 'DRAW_CARD'] },
  PRIME_104: { text: 'At the end of each of your<br>\nturns, gain +1/+1 if it<br>\nattacked, else -1/-1' },
  PRIME_142: { text: 'Your spell cards cost 1 less.<br>\nYour hero takes 1 damage<br>\nwhen you cast one' },
  PRIME_220: { text: 'Your minions that cost 4<br>\nor more cost 2 less<br>\n(never below 3)' },
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
  // the Warrior Bot token now has Rush
  const bot = byId.get('PRIME_019a');
  if (!bot) throw new Error('no PRIME_019a');
  updates.push({ id: bot.id, fields: { mechanics: ['RUSH'] } });
  console.log(dry ? 'DRY RUN' : 'updating', updates.length, 'records');
  if (dry) return;
  for (let i = 0; i < updates.length; i += 10) {
    await a.call('PATCH', `/${a.BASE}/${table.id}`, { records: updates.slice(i, i + 10), typecast: true });
  }
  if (!byId.has('PRIME_224a')) {
    await a.call('POST', `/${a.BASE}/${table.id}`, {
      fields: { id: 'PRIME_224a', name: 'Husk', set: 'PRIME', type: 'MINION', rarity: 'COMMON', cardClass: 'NONE', race: 'NONE', cost: 2, attack: 2, health: 2, isEntourage: true },
      typecast: true,
    });
  }
  console.log('done');
})();
