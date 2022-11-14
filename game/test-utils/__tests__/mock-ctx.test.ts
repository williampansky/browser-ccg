import { mockCtx } from '..';

describe('Handles creating a mock object of Ctx', () => {
  test('Should return the default state when no modifications are provided', () => {
    const fn = mockCtx();
    expect(fn.activePlayers).toBeNull();
    expect(fn.currentPlayer).toBe('0');
    expect(fn.gameover).toBeUndefined();
    expect(fn.numMoves).toBeUndefined();
    expect(fn.numPlayers).toBe(1);
    expect(fn.phase).toBe('');
    expect(fn.playOrder).toEqual(['0']);
    expect(fn.playOrderPos).toBe(0);
    expect(fn.turn).toBe(0);
  });
});
