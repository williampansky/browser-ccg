import { gapIndex } from '../board-position';

describe('gapIndex', () => {
  const four = [100, 200, 300, 400];
  it('is 0 left of every minion centre and the board length right of every one', () => {
    expect(gapIndex(four, 10)).toBe(0);
    expect(gapIndex(four, 99)).toBe(0);
    expect(gapIndex(four, 999)).toBe(4);
  });
  it('picks the gap between two minions', () => {
    expect(gapIndex(four, 150)).toBe(1);
    expect(gapIndex(four, 250)).toBe(2);
    expect(gapIndex(four, 350)).toBe(3);
  });
  it('is 0 on an empty board', () => {
    expect(gapIndex([], 50)).toBe(0);
  });
});
