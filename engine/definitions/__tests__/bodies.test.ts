import { produce } from 'immer';
import { effectiveCost } from '../../rules/cost';
import { legalActions } from '../../rules/legal-actions';
import { backTo, catalog, endTurn, failCode, hero, hurt, minion, mref, play, realCard, run, setup, stats, withWeapon } from '../../testing/real-cards';
import type { Action, GameState } from '../../state/types';

// The "exact body / exact warcry" rewrites (balance/PRIME-DISTANCE.md, applied by balance/airtable/prime-bodies.js).

const ids = '004 013 019 007 040 017 020 032 048 082 095 161 028 002 224 241 233 185 026 015 246 070 176 237 043 239 049 055 141 104 142 220'.split(' ');
it.each(ids)('PRIME_%s is defined', (n) => expect(legalActions(setup(`PRIME_${n}`, { mine: [[1, 3]], theirs: [[1, 3]] }), '0', catalog)).toBeDefined());

describe('simple stat and token changes', () => {
  it('013 is 1/3, 007 is 1/3, 040 is 4/4, 082 is 4/3, 095 is 4/5, 161 is 2/3, 049 is 2/2, 055 is 2/3', () => {
    const sz = (id: string) => [realCard(`PRIME_${id}`).attack, realCard(`PRIME_${id}`).health];
    expect([sz('013'), sz('007'), sz('040'), sz('082'), sz('095'), sz('161'), sz('049'), sz('055')]).toEqual([[1, 3], [1, 3], [4, 4], [4, 3], [4, 5], [2, 3], [2, 2], [2, 3]]);
  });
  it('019\'s Warrior Bot has Rush', () => {
    const died = produce(setup('CORE_043', { mine: [[2, 3, 'PRIME_019']] }), (g) => void (g.players['0'].board[0].health = 0));
    const r = play(died).state;
    expect([stats(r, '0'), minion(r, '0', 0).keywords.rush]).toEqual([[[2, 1]], true]);
  });
});

describe('demise', () => {
  it('004 Soul Miner hits a random enemy MINION for 2, or the hero if there is none', () => {
    const withMinion = produce(setup('CORE_043', { mine: [[1, 1, 'PRIME_004']], theirs: [[1, 9]] }), (g) => void (g.players['0'].board[0].health = 0));
    const r = play(withMinion).state;
    expect([stats(r, '1')[0][1], r.players['1'].health]).toEqual([7, 30]);
    const none = produce(setup('CORE_043', { mine: [[1, 1, 'PRIME_004']] }), (g) => void (g.players['0'].board[0].health = 0));
    expect(play(none).state.players['1'].health).toBe(28);
  });
  it('070 Rusted Warden: 2 damage to all enemies, and your minions get Bubble', () => {
    const s = produce(setup('CORE_043', { mine: [[4, 4, 'PRIME_070'], [1, 5]], theirs: [[1, 5]] }), (g) => void (g.players['0'].board[0].health = 0));
    const r = play(s).state;
    expect(stats(r, '1')[0][1]).toBe(3);
    expect(r.players['1'].health).toBe(28);
    expect(r.players['0'].health).toBe(30); // not your own hero
    expect(minion(r, '0', 0).keywords.bubble).toBe(true);
  });
  it('246 Chaos Knight swaps your weakest minion for the enemy\'s strongest', () => {
    const s = produce(setup('CORE_043', { mine: [[4, 5, 'PRIME_246'], [1, 1], [3, 3]], theirs: [[2, 2], [8, 8]] }), (g) => void (g.players['0'].board[0].health = 0));
    const r = play(s).state;
    expect(stats(r, '0').sort()).toEqual([[3, 3], [8, 8]].sort());
    expect(stats(r, '1').sort()).toEqual([[1, 1], [2, 2]].sort());
  });
});

describe('while on the board', () => {
  it('040 Slick Naga has Onslaught only while undamaged', () => {
    const calm = play(setup('CORE_043', { mine: [[4, 4, 'PRIME_040']] })).state;
    expect(minion(calm, '0', 0).keywords.doubleAttack).toBe(true);
    const hit = play(hurt(setup('CORE_043', { mine: [[4, 4, 'PRIME_040']] }), '0', 0, 3)).state;
    expect(minion(hit, '0', 0).keywords.doubleAttack).toBe(false);
  });
  it('043 Tra\'an Guard grows +1/+1 when YOUR characters are healed, not theirs', () => {
    const mine = play(setup('CORE_082', { mine: [[1, 2, 'PRIME_043']], heroHp: { '0': 10 } })).state; // CORE_082 heals your hero 4
    expect(stats(mine, '0')[0]).toEqual([2, 3]);
    const theirs = play(setup('CORE_082', { theirs: [[1, 2, 'PRIME_043']], heroHp: { '0': 10 } })).state;
    expect(stats(theirs, '1')[0]).toEqual([1, 2]);
  });
  it('176 Shaman Wudu heals the MOST damaged friendly minion 3 and your hero 1 at the end of your turn', () => {
    let s = setup('CORE_043', { mine: [[0, 5, 'PRIME_176'], [1, 9], [1, 9]], heroHp: { '0': 20 } });
    s = hurt(hurt(s, '0', 1, 8), '0', 2, 3);
    const r = endTurn(play(s).state);
    expect(stats(r, '0').map((x) => x[1])).toEqual([5, 8, 6]);
    expect(r.players['0'].health).toBe(21);
  });
  it('237 Spellsmith gives 2 Armor whenever a friendly minion dies (not an enemy one)', () => {
    const mine = produce(setup('CORE_043', { mine: [[1, 4, 'PRIME_237'], [1, 1]] }), (g) => void (g.players['0'].board[1].health = 0));
    expect(play(mine).state.players['0'].armor).toBe(2);
    const theirs = produce(setup('CORE_043', { mine: [[1, 4, 'PRIME_237']], theirs: [[1, 1]] }), (g) => void (g.players['1'].board[0].health = 0));
    expect(play(theirs).state.players['0'].armor).toBe(0);
  });
  it('239 Desert Rider gains +1 Attack this turn when an ENEMY minion takes damage', () => {
    const s = setup('CORE_125', { mine: [[2, 4, 'PRIME_239']], theirs: [[1, 9], [1, 9]] }); // 2 damage to each of two enemy minions
    const r = play(s).state;
    expect(stats(r, '0')[0][0]).toBe(4);
    expect(stats(endTurn(r), '0')[0][0]).toBe(2);
    const own = setup('CORE_043', { mine: [[2, 4, 'PRIME_239'], [1, 9]] });
    expect(stats(play(hurt(own, '0', 1, 5)).state, '0')[0][0]).toBe(2); // damage by setting health is not an event: nothing
  });
  it('049 Fiery Axe Thrower pings a random enemy MINION (not the hero) when you summon another minion', () => {
    const s = setup('PRIME_005', { mine: [[2, 2, 'PRIME_049']], theirs: [[1, 9]] }); // a plain minion (PRIME_034 would summon a second one)
    const r = play(s).state;
    expect([stats(r, '1')[0][1], r.players['1'].health]).toEqual([8, 30]);
    const none = play(setup('PRIME_005', { mine: [[2, 2, 'PRIME_049']] })).state;
    expect(none.players['1'].health).toBe(30);
  });
  it('055 Suicidal Wizard (2/3) hurts only enemy minions after you cast a spell', () => {
    const r = play(setup('CORE_043', { mine: [[2, 3, 'PRIME_055']], theirs: [[1, 3]] })).state;
    expect([stats(r, '0')[0][1], stats(r, '1')[0][1]]).toEqual([3, 2]);
  });
  it('141 Fierce Gremlin gains +1 Attack this turn per spell and draws when it reaches 4', () => {
    const s = setup('CORE_043', { mine: [[3, 3, 'PRIME_141']], hand: ['CORE_043'] });
    const hand = s.players['0'].hand.length;
    const r = play(s).state; // one spell: 3 -> 4 Attack, draws
    expect(stats(r, '0')[0][0]).toBe(4);
    expect(r.players['0'].hand.length).toBe(hand - 1 + 1);
    expect(stats(endTurn(r), '0')[0][0]).toBe(3);
    const low = play(setup('CORE_043', { mine: [[1, 3, 'PRIME_141']] })).state;
    expect([stats(low, '0')[0][0], low.players['0'].hand.length]).toEqual([2, 0]);
  });
  it('104 Perses gains +1/+1 at the end of your turn if it attacked, else loses 1/1', () => {
    let s = setup('CORE_043', { mine: [[5, 5, 'PRIME_104']], theirs: [[1, 50]] });
    s = play(s).state;
    const lazy = endTurn(s);
    expect(stats(lazy, '0')[0]).toEqual([4, 4]);
    const hit = run(s, { type: 'Attack', attackerId: s.players['0'].board[0].instanceId, target: hero('1') } as Action);
    if ('error' in hit) throw new Error(hit.error);
    expect(stats(endTurn(hit.state), '0')[0]).toEqual([6, 6]);
    expect(stats(backTo(lazy, '0'), '0')[0]).toEqual([4, 4]); // the opponent's turn end changes nothing
  });
  it('142 Demon Sorcerer: spells cost 1 less, but your hero takes 1 whenever you cast one', () => {
    const s = setup('CORE_043', { mine: [[3, 2, 'PRIME_142']] });
    expect(effectiveCost(s, '0', realCard('CORE_043'), catalog)).toBe(Math.max(0, realCard('CORE_043').cost - 1));
    expect(play(s).state.players['0'].health).toBe(29);
  });
  it('220 Ancient Portal: only minions costing 4+ get 2 less, never below 3', () => {
    const s = setup('CORE_043', { mine: [[0, 4, 'PRIME_220']] });
    const cost = (c: string) => effectiveCost(s, '0', realCard(c), catalog);
    expect(cost('PRIME_034')).toBe(3); // 5 -> 3
    expect(cost('PRIME_062')).toBe(3); // 3 stays
    expect(cost('PRIME_085')).toBe(8); // 10 -> 8
    expect(cost('PRIME_074')).toBe(4); // 6 -> 4
    expect(cost('PRIME_244')).toBe(7); // 9 -> 7
    const four = Array.from(catalog.values()).find((c) => c.type === 'minion' && c.cost === 4 && c.source === 'core')!;
    expect(effectiveCost(s, '0', four, catalog)).toBe(3); // 4 -> 3 (floor)
  });
});

describe('warcries and spells', () => {
  it('017 Feline Fisherman: heal a character 3, or deal 1 damage to a character', () => {
    const s = setup('PRIME_017', { heroHp: { '1': 20 } });
    const heal = run(s, { type: 'PlayCard', handIndex: 0, choice: 0, target: hero('1') } as Action);
    expect('error' in heal ? -1 : heal.state.players['1'].health).toBe(23);
    const dmg = run(s, { type: 'PlayCard', handIndex: 0, choice: 1, target: hero('1') } as Action);
    expect('error' in dmg ? -1 : dmg.state.players['1'].health).toBe(19);
  });
  it('020 Magic Mushroom can only Suppress a minion with Cost 3 or less', () => {
    const s = setup('PRIME_020', { theirs: [[1, 1, 'PRIME_062'], [1, 1, 'PRIME_074']] }); // costs 3 and 6
    expect(play(s, mref(s, '1', 0)).state.players['1'].board[0].silenced).toBe(true);
    expect(failCode(s, mref(s, '1', 1))).toBe('ILLEGAL_TARGET');
    expect(failCode(s, hero('1'))).toBe('ILLEGAL_TARGET');
  });
  it('032 Siren Suppresses an enemy minion and draws only if it had a warcry or demise', () => {
    const s = setup('PRIME_032', { theirs: [[1, 1, 'PRIME_013'], [1, 1, 'PRIME_074'], [1, 1, 'PRIME_034']], mine: [[1, 1]] });
    expect(play(s, mref(s, '1', 0)).state.players['0'].hand).toHaveLength(1); // 013 has a demise
    expect(play(s, mref(s, '1', 1)).state.players['0'].hand).toHaveLength(0); // 074 is a plain Guard
    expect(play(s, mref(s, '1', 2)).state.players['0'].hand).toHaveLength(1); // 034 has a warcry
    expect(failCode(s, mref(s, '0', 0))).toBe('ILLEGAL_TARGET'); // enemy only
  });
  it('048 Invoked Shaman swaps Attack and Health and Disables the minion', () => {
    const s = setup('PRIME_048', { theirs: [[2, 7]] });
    const m = minion(play(s, mref(s, '1', 0)).state, '1', 0);
    expect([m.attack, m.health, m.disabledOnTurn !== undefined]).toEqual([7, 2, true]);
  });
  it('082 Foxy Huntsman destroys a 6+ Attack minion only if it is damaged or has attacked', () => {
    const s = setup('PRIME_082', { theirs: [[7, 9], [6, 9], [5, 5]] });
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET'); // healthy
    const hurtOne = hurt(s, '1', 0, 8);
    expect(play(hurtOne, mref(hurtOne, '1', 0)).state.players['1'].board).toHaveLength(2);
    const attacked = produce(s, (g) => void (g.players['1'].board[1].attacksThisTurn = 1));
    expect(play(attacked, mref(attacked, '1', 1)).state.players['1'].board).toHaveLength(2);
    expect(failCode(hurt(s, '1', 2, 1), mref(hurt(s, '1', 2, 1), '1', 2))).toBe('ILLEGAL_TARGET'); // only 5 Attack
  });
  it('095 The Inquisitor destroys the enemy weapon and gives you its Attack as Armor', () => {
    const s = withWeapon(setup('PRIME_095'), '1');
    const r = play(s).state;
    expect(r.players['1'].weapon).toBeNull();
    expect(r.players['0'].armor).toBe(2); // the test weapon has 2 Attack
    expect(play(setup('PRIME_095')).state.players['0'].armor).toBe(0);
  });
  it('161 Enigmatic Courier halves a minion\'s Attack, rounded down', () => {
    const s = setup('PRIME_161', { theirs: [[7, 5]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[3, 5]]);
  });
  it('028 gives +3 Attack this turn; 002 gives a FRIENDLY minion +2 Attack and 1 damage', () => {
    const a = setup('PRIME_028', { theirs: [[1, 3]] });
    expect(stats(play(a, mref(a, '1', 0)).state, '1')[0][0]).toBe(4);
    const b = setup('PRIME_002', { mine: [[1, 3]], theirs: [[1, 3]] });
    expect(stats(play(b, mref(b, '0', 0)).state, '0')[0]).toEqual([3, 2]); // +2 Attack, 1 damage
    expect(failCode(b, mref(b, '1', 0))).toBe('ILLEGAL_TARGET');
  });
  it('224 Takeover destroys a minion and summons a 2/2 Husk for you', () => {
    const s = setup('PRIME_224', { theirs: [[1, 50]] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['1'].board).toHaveLength(0);
    expect(stats(r, '0')).toEqual([[2, 2]]);
  });
  it('241 Outer Beam deals damage equal to your Armor, then you lose half of it (rounded up)', () => {
    const s = produce(setup('PRIME_241', { theirs: [[1, 20]] }), (g) => void (g.players['0'].armor = 5));
    const r = play(s, mref(s, '1', 0)).state;
    expect([stats(r, '1')[0][1], r.players['0'].armor]).toEqual([15, 2]);
  });
  it('233 Battle Shield gives a damaged minion +2/+4', () => {
    const s = hurt(setup('PRIME_233', { theirs: [[1, 5], [1, 5]] }), '1', 1, 2);
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET');
    expect(stats(play(s, mref(s, '1', 1)).state, '1')[1]).toEqual([3, 6]);
  });
});

describe('return to hand', () => {
  it('185 Into the Shadows returns a friendly minion to hand, 1 cheaper, with Rush when played', () => {
    const s = setup('PRIME_185', { mine: [[4, 4, 'PRIME_062']] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(r.players['0'].board).toHaveLength(0);
    const card = r.players['0'].hand.find((c) => c.cardId === 'PRIME_062')!;
    expect([card.costDelta, card.rushOnPlay]).toEqual([-1, true]);
    expect(effectiveCost(r, '0', realCard('PRIME_062'), catalog, undefined, card.costDelta)).toBe(2);
    const replay = run({ ...r, players: { ...r.players, '0': { ...r.players['0'], hand: [card], energy: { current: 10, total: 10 } } } }, { type: 'PlayCard', handIndex: 0 } as Action);
    expect('error' in replay ? false : replay.state.players['0'].board[0].keywords.rush).toBe(true);
    const enemy = setup('PRIME_185', { theirs: [[1, 1]] });
    expect(failCode(enemy, mref(enemy, '1', 0))).toBe('ILLEGAL_TARGET');
  });
  it('026 and 015 return a friendly minion (never the enemy\'s)', () => {
    for (const id of ['PRIME_026', 'PRIME_015']) {
      const s = setup(id, { mine: [[3, 3, 'PRIME_062']], theirs: [[1, 1]] });
      const r = play(s, mref(s, '0', 0)).state;
      expect(r.players['0'].board.map((m) => m.cardId)).toEqual([id]);
      expect(r.players['0'].hand.map((c) => c.cardId)).toContain('PRIME_062');
      expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET');
    }
  });
});
