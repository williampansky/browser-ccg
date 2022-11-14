import getContextualPlayerIds from "../get-contextual-player-ids";

describe('Returns an object of player/opponent IDs based on param', () => {
  test('Should return 0/1 if param is 0', () => {
    const fn = getContextualPlayerIds('0');
    expect(fn).toEqual({ player: '0', opponent: '1' });
  });

  test('Should return 1/0 if param is 1', () => {
    const fn = getContextualPlayerIds('1');
    expect(fn).toEqual({ player: '1', opponent: '0' });
  });
});
