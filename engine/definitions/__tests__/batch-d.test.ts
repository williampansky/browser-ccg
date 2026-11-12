import { isPlayable } from '../../decks';
import { getCardDef } from '..';
import { backTo, catalog, endTurn, failCode, hero, hurt, legalTargets, mref, play, realCard, setup, stats } from '../../testing/real-cards';

// Batch D: the first PRIME cards, built only from effects CORE already uses. Each test plays the REAL card from data.

const ids = [
  ...['013', '004', '019', '097', '034', '136', '217', '062', '039', '210', '102', '061', '170', '165', '162', '228'],
  ...['218', '175', '161', '038', '101', '082', '224', '180', '150', '167', '073', '055', '141', '076', '069'],
  ...['027', '018', '128', '225', '011'],
].map((n) => `PRIME_${n}`);

describe('Batch D cards are all defined and playable', () => {
  it.each(ids)('%s', (id) => {
    expect(getCardDef(realCard(id))).toBeDefined();
    expect(isPlayable(realCard(id))).toBe(true);
  });
});

describe('warcries on your own hero or itself', () => {
  it('PRIME_217 costs you 3 life', () => expect(play(setup('PRIME_217')).state.players['0'].health).toBe(27));
  it('PRIME_062 damages ITSELF for 4 (a 5/4), not your hero', () => {
    const r = play(setup('PRIME_062')).state;
    expect(stats(r, '0')).toEqual([[5, 4]]);
    expect(r.players['0'].health).toBe(30);
  });
  it('PRIME_039 heals you 5 (capped at 30)', () => {
    expect(play(setup('PRIME_039', { heroHp: { '0': 10 } })).state.players['0'].health).toBe(15);
    expect(play(setup('PRIME_039', { heroHp: { '0': 28 } })).state.players['0'].health).toBe(30);
  });
  it('PRIME_034 summons its Warpig Mercenary', () => {
    expect(stats(play(setup('PRIME_034')).state, '0')).toEqual([[4, 4], [2, 2]]);
  });
});

describe('targeted warcries and spells', () => {
  it('PRIME_101 only aims at an enemy Guard and destroys it', () => {
    const s = setup('PRIME_101', { theirs: [[1, 9], [1, 9]], mine: [[1, 1]] });
    const guarded = { ...s, players: { ...s.players, '1': { ...s.players['1'], board: s.players['1'].board.map((m, i) => (i === 1 ? { ...m, keywords: { ...m.keywords, guard: true } } : m)) } } };
    expect(legalTargets(guarded, { kind: 'card', handIndex: 0 }, catalog).map((t) => (t.kind === 'minion' ? t.instanceId : -1))).toEqual([guarded.players['1'].board[1].instanceId]);
    expect(play(guarded, mref(guarded, '1', 1)).state.players['1'].board).toHaveLength(1);
  });
  it('PRIME_082 aims at any minion with 7+ Attack', () => {
    const s = setup('PRIME_082', { theirs: [[7, 1], [6, 1]], mine: [[8, 8]] });
    expect(failCode(s, mref(s, '1', 1))).toBe('ILLEGAL_TARGET');
    expect(play(s, mref(s, '1', 0)).state.players['1'].board).toHaveLength(1);
    expect(play(s, mref(s, '0', 0)).state.players['0'].board).toHaveLength(1);
  });
  it('PRIME_224 destroys a minion and heals you 3', () => {
    const s = setup('PRIME_224', { theirs: [[1, 50]], heroHp: { '0': 10 } });
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['1'].board).toHaveLength(0);
    expect(r.players['0'].health).toBe(13);
  });
  it('PRIME_180 deals 5 to the target and heals you 5', () => {
    const s = setup('PRIME_180', { heroHp: { '0': 10 } });
    const r = play(s, hero('1')).state;
    expect(r.players['1'].health).toBe(25);
    expect(r.players['0'].health).toBe(15);
  });
  it('PRIME_218 gives a friendly minion +2/+2 and refuses an enemy one', () => {
    const s = setup('PRIME_218', { mine: [[2, 3]], theirs: [[2, 3]] });
    expect(stats(play(s, mref(s, '0', 0)).state, '0')).toEqual([[4, 5]]);
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET');
  });
  it('PRIME_161 sets a minion\'s Attack to 1', () => {
    const s = setup('PRIME_161', { theirs: [[6, 6]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[1, 6]]);
  });
  it('PRIME_150 damages every enemy minion and disables the survivors', () => {
    const s = setup('PRIME_150', { theirs: [[1, 2], [1, 5]] });
    const r = play(s).state;
    expect(stats(r, '1')).toEqual([[1, 3]]);
    expect(r.players['1'].board[0].disabledOnTurn).toBeDefined();
  });
});

describe('board spells', () => {
  it('PRIME_162 sets every minion\'s health to 1', () => {
    const r = play(setup('PRIME_162', { mine: [[2, 5]], theirs: [[3, 7]] })).state;
    expect([stats(r, '0')[0][1], stats(r, '1')[0][1]]).toEqual([1, 1]);
  });
  it('PRIME_170 heals every minion 4 but not heroes', () => {
    let s = setup('PRIME_170', { mine: [[1, 9]], theirs: [[1, 9]], heroHp: { '1': 20 } });
    s = hurt(hurt(s, '0', 0, 2), '1', 0, 2);
    const r = play(s).state;
    expect([stats(r, '0')[0][1], stats(r, '1')[0][1], r.players['1'].health]).toEqual([6, 6, 20]);
  });
  it('PRIME_165 gives all your minions Bubble', () => {
    const r = play(setup('PRIME_165', { mine: [[1, 1], [1, 1]], theirs: [[1, 1]] })).state;
    expect(r.players['0'].board.every((m) => m.keywords.bubble)).toBe(true);
    expect(r.players['1'].board[0].keywords.bubble).toBe(false);
  });
  it('PRIME_167 hits up to 8 distinct enemies for 8', () => {
    const r = play(setup('PRIME_167', { theirs: [[1, 20], [1, 20]] })).state;
    expect(stats(r, '1')).toEqual([[1, 12], [1, 12]]);
    expect(r.players['1'].health).toBe(22);
  });
});

describe('demise', () => {
  const kill = (id: string, extra = {}) => {
    const s = setup('CORE_043', { mine: [[1, 1, id]], ...extra });
    // a spell that kills: put the minion at 0 health and let the engine settle on the next action
    const dying = hurt(s, '0', 0, 0);
    return play(dying).state;
  };
  it('PRIME_013 draws a card', () => expect(kill('PRIME_013').players['0'].hand.length).toBe(1));
  it('PRIME_004 deals 2 to the enemy hero', () => expect(kill('PRIME_004').players['1'].health).toBe(28));
  it('PRIME_136 summons two 2/2 Creatures', () => {
    const r = kill('PRIME_136');
    expect(stats(r, '0')).toEqual([[2, 2], [2, 2]]);
    expect(realCard('PRIME_136a').race).toBe('CREATURE');
  });
  it('PRIME_019 summons a 2/1', () => expect(stats(kill('PRIME_019'), '0')).toEqual([[2, 1]]));
});

describe('whenever you cast a spell', () => {
  const cast = (id: string, extra = {}) => play(setup('CORE_043', { mine: [[1, 1, id]], ...extra })).state;
  it('PRIME_073 draws', () => expect(cast('PRIME_073').players['0'].hand.length).toBe(1));
  it('PRIME_141 gains +1 Attack', () => expect(stats(cast('PRIME_141'), '0')[0][0]).toBe(2));
  it('PRIME_076 gains +2/+2', () => expect(stats(cast('PRIME_076'), '0')[0]).toEqual([3, 3]));
  it('PRIME_055 hurts every minion 1', () => {
    const r = play(setup('CORE_043', { mine: [[1, 4, 'PRIME_055']], theirs: [[1, 3]] })).state;
    expect([stats(r, '0')[0][1], stats(r, '1')[0][1]]).toEqual([3, 2]);
  });
  it('PRIME_069 summons a Spider', () => expect(stats(cast('PRIME_069'), '0')).toHaveLength(2));
  it('does not fire for another player\'s spell', () => {
    const s = setup('CORE_043', { theirs: [[1, 1, 'PRIME_141']] });
    expect(stats(play(s).state, '1')[0][0]).toBe(1);
  });
});

describe('end of turn', () => {
  it('PRIME_210 draws at the end of YOUR turn only', () => {
    const s = setup('CORE_043', { mine: [[0, 3, 'PRIME_210']] });
    const handAfterSpell = play(s).state;
    const before = handAfterSpell.players['0'].hand.length;
    const mid = endTurn(handAfterSpell);
    expect(mid.players['0'].hand.length).toBe(before + 1);
    const back = backTo(mid, '0');
    expect(back.players['0'].hand.length).toBeGreaterThan(before + 1);
  });
  it('PRIME_102 hits everyone else for 2 at the end of your turn', () => {
    const s = setup('CORE_043', { mine: [[1, 5, 'PRIME_102'], [1, 5]], theirs: [[1, 5]] });
    const r = endTurn(play(s).state);
    expect(stats(r, '0')).toEqual([[1, 5], [1, 3]]);
    expect(stats(r, '1')).toEqual([[1, 3]]);
    expect(r.players['1'].health).toBe(28);
    expect(r.players['0'].health).toBe(28);
  });
  it('PRIME_061 takes 1 and summons an Ice Fish', () => {
    const r = endTurn(play(setup('CORE_043', { mine: [[0, 6, 'PRIME_061']] })).state);
    expect(stats(r, '0')).toEqual([[0, 5], [1, 1]]);
  });
});

describe('minion deaths and auras', () => {
  const killOther = (id: string, extra = {}) => {
    const s = setup('CORE_043', { mine: [[1, 1, id], [1, 1]], ...extra });
    return play(hurt(s, '0', 1, 0)).state;
  };
  it('PRIME_027 draws when a minion dies', () => expect(killOther('PRIME_027').players['0'].hand.length).toBe(1));
  it('PRIME_018 gains +1 Attack', () => expect(stats(killOther('PRIME_018'), '0')[0][0]).toBe(2));
  it('PRIME_128 only reacts to a friendly Creature', () => {
    const s = setup('CORE_043', { mine: [[1, 1, 'PRIME_128'], [1, 1, 'PRIME_061']] });
    expect(stats(play(hurt(s, '0', 1, 0)).state, '0')[0]).toEqual([1, 1]); // PRIME_061 is not a Creature
    const c = setup('CORE_043', { mine: [[1, 1, 'PRIME_128'], [1, 1, 'CORE_070a']] });
    expect(stats(play(hurt(c, '0', 1, 0)).state, '0')[0]).toEqual([3, 2]);
  });
  it('PRIME_225 gives your OTHER minions +1 Attack', () => {
    const s = setup('CORE_043', { mine: [[1, 1, 'PRIME_225'], [2, 2]], theirs: [[2, 2]] });
    const r = play(s).state;
    expect([stats(r, '0')[1][0], stats(r, '0')[0][0], stats(r, '1')[0][0]]).toEqual([3, 1, 2]);
  });
  it('PRIME_011 buffs adjacent minions only', () => {
    const s = setup('CORE_043', { mine: [[2, 2], [1, 1, 'PRIME_011'], [2, 2], [2, 2]] });
    expect(stats(play(s).state, '0').map((x) => x[0])).toEqual([3, 1, 3, 2]);
  });
});
