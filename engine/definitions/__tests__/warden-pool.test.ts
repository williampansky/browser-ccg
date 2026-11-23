import {
  minion,
  mref,
  play,
  run,
  setup,
  stats,
  withWeapon,
} from '../../testing/real-cards';
import type { Action } from '../../state/types';

// The Warden's last two undefined PRIME cards (the tokens are PRIME_122a and
// PRIME_125a to c).

describe('PRIME_122', () => {
  it('summons three 2/2 minions with Rush', () => {
    const state = play(setup('PRIME_122', {})).state;
    expect(stats(state, '0')).toEqual([
      [2, 2],
      [2, 2],
      [2, 2],
    ]);
    expect(state.players['0'].board.every((m) => m.keywords.rush)).toBe(true);
  });
});

describe('PRIME_125', () => {
  const choose = (choice: number) => {
    const result = run(setup('PRIME_125', { mine: [[1, 1]] }), {
      type: 'PlayCard',
      handIndex: 0,
      choice,
    } as Action);
    if ('error' in result) throw new Error(result.error);
    return result.state;
  };

  it('option 1 gives only the other minions +2/+2', () => {
    const state = choose(0);
    expect(stats(state, '0')).toEqual([
      [3, 3],
      [5, 8],
    ]);
  });

  it('option 2 summons two 2/2 Treants with Guard', () => {
    const state = choose(1);
    const board = state.players['0'].board;
    expect(board).toHaveLength(4);
    expect(minion(state, '0', 0).keywords.guard).toBe(false);
    expect(
      stats(state, '0').filter(([a, h]) => a === 2 && h === 2),
    ).toHaveLength(2);
    expect(board.filter((m) => m.keywords.guard)).toHaveLength(2);
  });
});

describe('PRIME_118', () => {
  it('equips a one-turn 4 Attack weapon and gains 4 Armor', () => {
    const state = play(setup('PRIME_118', {})).state;
    const { weapon, armor } = state.players['0'];
    expect([weapon?.attack, weapon?.temporary, armor]).toEqual([4, true, 4]);
  });

  it('adds 4 Attack to a weapon already equipped', () => {
    const state = play(withWeapon(setup('PRIME_118', {}), '0')).state;
    expect(state.players['0'].weapon?.attack).toBe(6);
  });
});

describe('PRIME_117', () => {
  it('deals damage equal to the weapon Attack to a minion', () => {
    const start = withWeapon(setup('PRIME_117', { theirs: [[1, 9]] }), '0');
    const state = play(start, mref(start, '1', 0)).state;
    expect(stats(state, '1')[0][1]).toBe(7);
  });

  it('does nothing without a weapon', () => {
    const start = setup('PRIME_117', { theirs: [[1, 9]] });
    const state = play(start, mref(start, '1', 0)).state;
    expect(stats(state, '1')[0][1]).toBe(9);
  });
});
