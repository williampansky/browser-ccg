import { legalActions } from '../../rules/legal-actions';
import { backTo, catalog, endTurn, failCode, hero, hurt, mref, minion, play, run, setup, stats, withWeapon } from '../../testing/real-cards';
import type { Action } from '../../state/types';

// Batch E: this-turn boosts, adjacency, random friendly picks, stat swaps, hero health, and the choose-one PRIME cards.

const ids = '104 059 028 002 232 048 172 163 010 068 105 241 160 066 054 046 052 176 231 115 124 113 120 112 121 123'.split(' ');
it.each(ids)('PRIME_%s is defined and playable', (n) => {
  const s = setup(`PRIME_${n}`, { mine: [[1, 3]], theirs: [[1, 3]] });
  expect(legalActions(s, '0', catalog).some((a) => a.type === 'PlayCard' && a.handIndex === 0)).toBe(true);
});

const choose = (id: string, choice: number, opts: Parameters<typeof setup>[1], target?: ReturnType<typeof hero>) => {
  const s = setup(id, opts);
  const r = run(s, { type: 'PlayCard', handIndex: 0, choice, target } as Action);
  if ('error' in r) throw new Error(r.error);
  return r.state;
};

describe('targeted warcries and spells', () => {
  it('PRIME_232 trades 1 Health for +2 Attack', () => {
    const s = setup('PRIME_232', { theirs: [[1, 4]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[3, 3]]);
  });
  it('PRIME_048 swaps Attack and Health; PRIME_172 sets Attack to Health; PRIME_163 doubles Attack', () => {
    let s = setup('PRIME_048', { theirs: [[2, 7]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[7, 2]]);
    s = setup('PRIME_172', { theirs: [[2, 7]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[7, 7]]);
    s = setup('PRIME_163', { theirs: [[3, 7]] });
    expect(stats(play(s, mref(s, '1', 0)).state, '1')).toEqual([[6, 7]]);
  });
  it('PRIME_160 gives a friendly minion Bubble (and has none itself)', () => {
    const s = setup('PRIME_160', { mine: [[1, 1]], theirs: [[1, 1]] });
    const r = play(s, mref(s, '0', 0)).state;
    expect(minion(r, '0', 0).keywords.bubble).toBe(true);
    expect(minion(r, '0', 1).keywords.bubble).toBe(false);
    expect(failCode(s, mref(s, '1', 0))).toBe('ILLEGAL_TARGET');
  });
});

describe('own-stat warcries', () => {
  it('PRIME_010 gains your weapon\'s Attack (nothing without one)', () => {
    expect(stats(play(withWeapon(setup('PRIME_010'), '0')).state, '0')).toEqual([[4, 3]]);
    expect(stats(play(setup('PRIME_010')).state, '0')).toEqual([[2, 3]]);
  });
  it('PRIME_068 gains +1 Health for each other card in hand', () => {
    expect(stats(play(setup('PRIME_068', { hand: ['CORE_043', 'CORE_043', 'CORE_043'] })).state, '0')).toEqual([[4, 4]]);
  });
  it('PRIME_231 draws one card per injured friendly character', () => {
    let s = setup('PRIME_231', { mine: [[1, 5], [1, 5], [1, 5]] });
    s = hurt(hurt(s, '0', 0, 2), '0', 2, 4);
    s = { ...s, players: { ...s.players, '0': { ...s.players['0'], health: 20 } } };
    const r = play(s).state;
    expect(r.players['0'].hand.length).toBe(3);
  });
});

describe('adjacent warcries', () => {
  it('PRIME_066 buffs the neighbours +1/+1 and Guard, nobody else', () => {
    const s = setup('PRIME_066', { mine: [[1, 1], [1, 1], [1, 1]] });
    const r = run(s, { type: 'PlayCard', handIndex: 0, boardIndex: 1 } as Action);
    if ('error' in r) throw new Error(r.error);
    const b = r.state.players['0'].board;
    expect(b.map((m) => [m.attack, m.health, m.keywords.guard])).toEqual([[2, 2, true], [2, 3, false], [2, 2, true], [1, 1, false]]);
  });
  it('PRIME_054 gives its neighbours Guard (an edge minion has one neighbour)', () => {
    const s = setup('PRIME_054', { mine: [[1, 1], [1, 1]] });
    const r = run(s, { type: 'PlayCard', handIndex: 0, boardIndex: 0 } as Action);
    if ('error' in r) throw new Error(r.error);
    expect(r.state.players['0'].board.map((m) => m.keywords.guard)).toEqual([false, true, false]);
  });
});

describe('turn triggers', () => {
  it('PRIME_059 hits a random enemy for 2 at the start of YOUR turn', () => {
    const s = setup('CORE_043', { mine: [[0, 5, 'PRIME_059']] });
    const mid = endTurn(play(s).state);
    expect(mid.players['1'].health).toBe(30); // not the opponent's turn start
    const back = backTo(mid, '0');
    expect(back.players['1'].health).toBe(28);
  });
  it('PRIME_046 / 052 / 176 pick a random friendly minion at the end of your turn only', () => {
    const t = endTurn(play(setup('CORE_043', { mine: [[0, 2, 'PRIME_046']] })).state);
    expect(stats(t, '0')[0]).toEqual([0, 3]);
    const c = endTurn(play(setup('CORE_043', { mine: [[0, 4, 'PRIME_052']] })).state);
    expect(stats(c, '0')[0]).toEqual([1, 4]);
    const opp = endTurn(play(setup('CORE_043', { theirs: [[0, 2, 'PRIME_046']] })).state);
    expect(stats(opp, '1')[0]).toEqual([0, 2]);
  });
  it('PRIME_176 heals only a damaged friendly minion, 3 Health', () => {
    let s = setup('CORE_043', { mine: [[0, 5, 'PRIME_176'], [1, 9]] });
    s = hurt(s, '0', 1, 2);
    const r = endTurn(play(s).state);
    expect(stats(r, '0')).toEqual([[0, 5], [1, 5]]);
    const none = endTurn(play(setup('CORE_043', { mine: [[0, 5, 'PRIME_176']] })).state);
    expect(stats(none, '0')).toEqual([[0, 5]]);
  });
});
