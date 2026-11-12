import { isPlayable } from '../../decks';
import { getCardDef } from '..';
import { catalog, failCode, hero, hurt, legalTargets, mref, play, realCard, setup, stats, withWeapon } from '../../testing/real-cards';
import type { GameState, TargetRef } from '../../state/types';

// Batch B: cards that needed small new effects (destroy, transform, set stat, discard, steal, ...).

const ids = [
  ...['080', '097', '098', '089', '090', '101', '126', '093', '070', '109', '056', '075', '088'],
  ...['046', '059', '099', '110', '123', '103', '104', '086', '066', '105', '119', '115', '116', '118'],
  ...['057', '064', '033', '007', '092', '113'],
].map((n) => `CORE_${n}`);

describe('Batch B cards are all defined and playable', () => {
  it.each(ids)('%s', (id) => {
    expect(getCardDef(realCard(id))).toBeDefined();
    expect(isPlayable(realCard(id))).toBe(true);
  });
});

const targets = (s: GameState): TargetRef[] => legalTargets(s, { kind: 'card', handIndex: 0 }, catalog);
const ids2 = (s: GameState, t: TargetRef[]) =>
  t.map((x) => (x.kind === 'hero' ? `h${x.player}` : `m${s.players['0'].board.concat(s.players['1'].board).findIndex((m) => m.instanceId === x.instanceId)}`));

describe('damage plus draw', () => {
  it.each([
    ['CORE_080', 3],
    ['CORE_097', 1],
  ])('%s deals %i damage and draws a card', (id, dmg) => {
    const s = setup(id, { theirs: [[1, 9]] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '1')[0][1]).toBe(9 - dmg);
    expect(r.players['0'].hand).toHaveLength(1);
    expect(play(s, hero('1')).state.players['1'].health).toBe(30 - dmg);
  });
  it('098 deals 1 to all enemy minions and draws exactly one card', () => {
    const r = play(setup('CORE_098', { mine: [[1, 5]], theirs: [[1, 5], [1, 5]] })).state;
    expect(stats(r, '1')).toEqual([[1, 4], [1, 4]]);
    expect(stats(r, '0')).toEqual([[1, 5]]);
    expect(r.players['0'].hand).toHaveLength(1);
  });
  it('115 deals 1 to a minion and draws only if it dies', () => {
    const s = setup('CORE_115', { theirs: [[1, 1], [1, 5]] });
    expect(play(s, mref(s, '1', 0)).state.players['0'].hand).toHaveLength(1);
    expect(play(s, mref(s, '1', 1)).state.players['0'].hand).toHaveLength(0);
    expect(ids2(s, targets(s)).every((t) => t.startsWith('m'))).toBe(true); // minions only
  });
});

describe('destroy', () => {
  it('089 destroys an enemy minion with 3 or less Attack, and only offers those', () => {
    const s = setup('CORE_089', { mine: [[1, 1]], theirs: [[3, 5], [4, 5]] });
    expect(ids2(s, targets(s))).toEqual(['m1']); // m0 is mine, m1 enemy 3/5, m2 enemy 4/5
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[4, 5]]);
    expect(failCode(s, mref(s, '1', 1))).toBe('ILLEGAL_TARGET');
  });
  it('090 destroys an enemy minion with 5 or more Attack', () => {
    const s = setup('CORE_090', { theirs: [[4, 5], [5, 5]] });
    expect(ids2(s, targets(s))).toEqual(['m1']);
    expect(stats(play(s, mref(s, '1', 1)).state, '1')).toEqual([[4, 5]]);
  });
  it('101 destroys any minion, ignoring Bubble and health', () => {
    const s = setup('CORE_101', { mine: [[1, 1]], theirs: [[1, 99]] });
    expect(play(s, mref(s, '1', 0)).state.players['1'].board).toHaveLength(0);
    expect(play(s, mref(s, '0', 0)).state.players['0'].board).toHaveLength(0);
    expect(failCode(s, hero('1'))).toBe('ILLEGAL_TARGET');
  });
  it('126 destroys only an already damaged minion', () => {
    const s = hurt(setup('CORE_126', { theirs: [[1, 5], [1, 5]] }), '1', 1, 4);
    expect(ids2(s, targets(s))).toEqual(['m1']);
    expect(stats(play(s, mref(s, '1', 1)).state, '1')).toEqual([[1, 5]]);
  });
  it('093 costs 0 and deals 2 to an unhurt minion only', () => {
    const s = hurt(setup('CORE_093', { theirs: [[1, 5], [1, 5]] }), '1', 0, 4);
    expect(realCard('CORE_093').cost).toBe(0);
    expect(ids2(s, targets(s))).toEqual(['m1']);
    expect(stats(play(s, mref(s, '1', 1)).state, '1')[1][1]).toBe(3);
  });
  it('113 sacrifices one of your Demonic minions for 5 HP', () => {
    const s = setup('CORE_113', { mine: [[1, 1], [4, 4, 'CORE_028']], heroHp: { '0': 10 } });
    expect(ids2(s, targets(s))).toEqual(['m1']); // only the Demonic one
    expect(failCode(s, mref(s, '0', 0))).toBe('ILLEGAL_TARGET');
    const r = play(s, mref(s, '0', 1)).state;
    expect(stats(r, '0')).toEqual([[1, 1]]);
    expect(r.players['0'].health).toBe(15);
  });
  it('113 with no Demonic minion cannot be played', () => {
    expect(failCode(setup('CORE_113', { mine: [[1, 1]] }))).toBe('ILLEGAL_TARGET');
  });
});

describe('transform', () => {
  it('070 turns an enemy minion into a fresh 1/1 Creature in the same slot', () => {
    let s = setup('CORE_070', { theirs: [[5, 5], [3, 3]] });
    s = hurt(s, '1', 0, 2);
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '1')).toEqual([[1, 1], [3, 3]]);
    expect(r.players['1'].board[0].cardId).toBe('CORE_070a');
    expect(r.players['1'].board[0].instanceId).not.toBe(s.players['1'].board[0].instanceId);
    const mine = setup('CORE_070', { mine: [[1, 1]] });
    expect(failCode(mine, mref(mine, '0', 0))).toBe('ILLEGAL_TARGET');
  });
  it('109 turns any minion into a 0/1 Hellbunny with Guard', () => {
    const s = setup('CORE_109', { mine: [[4, 4]] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(stats(r, '0')).toEqual([[0, 1]]);
    expect(r.players['0'].board[0].keywords.guard).toBe(true);
  });
});

describe('stat changes', () => {
  it('056 sets a minion\'s health to 1', () => {
    const s = setup('CORE_056', { theirs: [[4, 7]] });
    const m = play(s, mref(s, '1', 0)).state.players['1'].board[0];
    expect([m.attack, m.health, m.maxHealth]).toEqual([4, 1, 1]);
  });
  it('075 sets a minion\'s Attack to 1 (text wins over hsclone)', () => {
    const s = setup('CORE_075', { theirs: [[4, 7]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[1, 7]]);
  });
  it('088 doubles a minion\'s current health (and raises max by the same amount)', () => {
    const s = hurt(setup('CORE_088', { mine: [[2, 6]] }), '0', 0, 4);
    const m = play(s, mref(s, '0', 0)).state.players['0'].board[0];
    expect([m.health, m.maxHealth]).toEqual([8, 10]);
  });
});

describe('keyword and buff items', () => {
  it('046 gives a minion Guard and +2/+2', () => {
    const s = setup('CORE_046', { theirs: [[2, 3]] });
    const m = play(s, mref(s, '1', 0)).state.players['1'].board[0];
    expect([m.attack, m.health, m.keywords.guard]).toEqual([4, 5, true]);
  });
  it('059 buffs a friendly Creature with Guard and +1/+2 (not a non-Creature, not an enemy one)', () => {
    const s = setup('CORE_059', { mine: [[2, 3], [3, 2, 'CORE_061']], theirs: [[3, 2, 'CORE_061']] });
    expect(ids2(s, targets(s))).toEqual(['m1']);
    const m = play(s, mref(s, '0', 1)).state.players['0'].board[1];
    expect([m.attack, m.health, m.keywords.guard]).toEqual([4, 4, true]);
  });
  it('099 and 110 give Onslaught (double attack)', () => {
    const a = setup('CORE_099', { mine: [[2, 3]] });
    expect(play(a, mref(a, '0', 0)).state.players['0'].board[0].keywords.doubleAttack).toBe(true);
    const b = setup('CORE_110', { theirs: [[2, 3]] });
    expect(play(b, mref(b, '1', 0)).state.players['1'].board[0].keywords.doubleAttack).toBe(true);
  });
  it('123 gives a friendly minion Rush', () => {
    const s = setup('CORE_123', { mine: [[2, 3]] });
    expect(play(s, mref(s, '0', 0)).state.players['0'].board[0].keywords.rush).toBe(true);
    const t = setup('CORE_123', { theirs: [[2, 3]] });
    expect(failCode(t, mref(t, '1', 0))).toBe('ILLEGAL_TARGET');
  });
  it('103 restores a friendly minion to full health and gives it Guard', () => {
    const s = hurt(setup('CORE_103', { mine: [[2, 6]] }), '0', 0, 1);
    const m = play(s, mref(s, '0', 0)).state.players['0'].board[0];
    expect([m.health, m.keywords.guard]).toEqual([6, true]);
  });
  it('104 gives all your minions +2 Health', () => {
    const r = play(setup('CORE_104', { mine: [[2, 3], [1, 1]], theirs: [[2, 3]] })).state;
    expect(stats(r, '0')).toEqual([[2, 5], [1, 3]]);
    expect(stats(r, '1')).toEqual([[2, 3]]);
  });
  it('086 gives a minion +2 Health and draws a card', () => {
    const s = setup('CORE_086', { mine: [[2, 3]] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(stats(r, '0')).toEqual([[2, 5]]);
    expect(r.players['0'].hand).toHaveLength(1);
  });
});

describe('damage plus an effect', () => {
  it('066 deals 3 to an enemy and Disables it', () => {
    const s = setup('CORE_066', { mine: [[1, 5]], theirs: [[2, 5]] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '1')).toEqual([[2, 2]]);
    expect(r.players['1'].board[0].disabledOnTurn).toBeDefined();
    expect(failCode(s, mref(s, '0', 0))).toBe('ILLEGAL_TARGET');
    expect(play(s, hero('1')).state.players['1'].health).toBe(27); // hero hit, nothing to disable
  });
  it('105 deals 1 to a target and Disables it', () => {
    const s = setup('CORE_105', { theirs: [[2, 5]] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '1')).toEqual([[2, 4]]);
    expect(r.players['1'].board[0].disabledOnTurn).toBeDefined();
  });
  it('119 deals 2 damage and heals your hero for the damage dealt', () => {
    const s = setup('CORE_119', { theirs: [[1, 5]], heroHp: { '0': 10 } });
    const r = play(s, mref(s, '1', 0)).state;
    expect([r.players['1'].board[0].health, r.players['0'].health]).toEqual([3, 12]);
  });
  it('116 deals 4 damage and discards a random card from your hand', () => {
    const s = setup('CORE_116', { theirs: [[1, 9]], hand: ['GRUNT', 'GRUNT'] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '1')[0][1]).toBe(5);
    expect(r.players['0'].hand).toHaveLength(1); // 3 in hand, 116 played, 1 discarded
  });
  it('116 and 118 with an empty hand discard nothing and do not fail', () => {
    const s = setup('CORE_116', { theirs: [[1, 9]] });
    expect(play(s, mref(s, '1', 0)).state.players['0'].hand).toHaveLength(0);
    expect(play(setup('CORE_118')).state.players['0'].hand).toHaveLength(0);
  });
  it('118 discards a random card', () => {
    expect(play(setup('CORE_118', { hand: ['GRUNT', 'GRUNT'] })).state.players['0'].hand).toHaveLength(1);
  });
});

describe('summons and the rest', () => {
  it('057 summons one random backup minion', () => {
    const tokens = realCard('CORE_057').entourage;
    const seen = new Set<string>();
    for (let seed = 1; seed <= 20; seed++) {
      const b = play(setup('CORE_057'), undefined, seed).state.players['0'].board;
      expect(b).toHaveLength(1);
      expect(tokens).toContain(b[0].cardId);
      seen.add(b[0].cardId);
    }
    expect(seen.size).toBeGreaterThan(1);
  });
  it('057b (a backup minion) is a plain Guard minion, the other two are not', () => {
    const guardOf = new Map<string, boolean>();
    for (let seed = 1; seed <= 40; seed++) {
      const m = play(setup('CORE_057'), undefined, seed).state.players['0'].board[0];
      guardOf.set(m.cardId, !!m.keywords.guard);
    }
    expect(guardOf.get('CORE_057b')).toBe(true);
    expect(guardOf.get('CORE_057a')).toBe(false);
    expect(guardOf.get('CORE_057c')).toBe(false);
  });
  it('064 summons a pair of 0/2 Guard minions', () => {
    const b = play(setup('CORE_064')).state.players['0'].board;
    expect(b.map((m) => [m.attack, m.health, m.keywords.guard])).toEqual([[0, 2, true], [0, 2, true]]);
  });
  it('064 on a board with one free slot summons only one', () => {
    expect(play(setup('CORE_064', { mine: Array(6).fill([1, 1]) as [number, number][] })).state.players['0'].board).toHaveLength(7);
  });
  it('033 gains +1/+1 for each other friendly minion', () => {
    const r = play(setup('CORE_033', { mine: [[1, 1], [1, 1]] })).state;
    expect(stats(r, '0')[2]).toEqual([4 + 2, 4 + 2]);
    expect(stats(play(setup('CORE_033')).state, '0')[0]).toEqual([4, 4]);
  });
  it('007 destroys the opponent\'s weapon, and can\'t attack', () => {
    const s = withWeapon(setup('CORE_007'), '1');
    const r = play(s).state;
    expect(r.players['1'].weapon).toBeNull();
    expect(r.players['0'].board[0].keywords.noAttack).toBe(true);
    expect(play(setup('CORE_007')).state.players['1'].weapon).toBeNull(); // no weapon: still playable
  });
  it('092 steals an enemy minion (summoning sick), unless your board is full', () => {
    const s = setup('CORE_092', { theirs: [[3, 3]] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['1'].board).toHaveLength(0);
    expect(r.players['0'].board[0]).toMatchObject({ attack: 3, health: 3, playedOnTurn: s.turn });
    const full = setup('CORE_092', { mine: Array(7).fill([1, 1]) as [number, number][], theirs: [[3, 3]] });
    expect(play(full, mref(full, '1', 0)).state.players['1'].board).toHaveLength(1);
    expect(failCode(s, hero('1'))).toBe('ILLEGAL_TARGET');
  });
});
