import { produce } from 'immer';
import { getCardDef } from '..';
import {
  failCode,
  hero,
  mref,
  play,
  realCard,
  setup,
  stats,
} from '../../testing/real-cards';

// CORE_156: summon a copy of a chosen enemy minion (for the caster).
describe('CORE_156', () => {
  it('is defined', () => {
    expect(getCardDef(realCard('CORE_156'))).toBeDefined();
  });
  it('puts a copy of the enemy minion on your board, with its current stats, and leaves the original', () => {
    const s = setup('CORE_156', {
      mine: [[1, 1]],
      theirs: [[3, 5, 'CORE_062']],
    });
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '0')).toEqual([
      [1, 1],
      [3, 5],
    ]);
    expect(r.players['0'].board[1].cardId).toBe('CORE_062');
    expect(stats(r, '1')).toEqual([[3, 5]]);
  });
  it('copies damage and keywords as they are now', () => {
    let s = setup('CORE_156', { theirs: [[3, 5]] });
    s = produce(s, (g) => {
      g.players['1'].board[0].health = 2;
      g.players['1'].board[0].keywords.guard = true;
    });
    const r = play(s, mref(s, '1', 0)).state;
    expect(stats(r, '0')).toEqual([[3, 2]]);
    expect(r.players['0'].board[0].keywords.guard).toBe(true);
  });
  it('the copy can not attack the turn it arrives', () => {
    const s = setup('CORE_156', { theirs: [[3, 5]] });
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['0'].board[0].playedOnTurn).toBe(r.turn);
  });
  it('only enemy minions can be aimed at', () => {
    const s = setup('CORE_156', { mine: [[2, 2]], theirs: [[3, 5]] });
    expect(failCode(s, mref(s, '0', 0))).toBe('ILLEGAL_TARGET');
    expect(failCode(s, hero('1'))).toBe('ILLEGAL_TARGET');
  });
  it('with a full board the spell resolves and nothing is summoned', () => {
    const s = setup('CORE_156', {
      mine: Array(7).fill([1, 1]),
      theirs: [[3, 5]],
    });
    const r = play(s, mref(s, '1', 0)).state;
    expect(r.players['0'].board).toHaveLength(7);
  });
});
