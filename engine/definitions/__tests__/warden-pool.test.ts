import { minion, play, run, setup, stats } from '../../testing/real-cards';
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
