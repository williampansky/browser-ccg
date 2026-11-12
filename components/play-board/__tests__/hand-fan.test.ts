import { fanDrop, fanRotation, handZoom, HAND_OVERLAP } from '../hand-fan';

describe('hand fan', () => {
  it('tilts the left end left and the right end right, mirrored', () => {
    for (const n of [2, 3, 5, 8, 10]) {
      expect(fanRotation(0, n)).toBeLessThan(0);
      expect(fanRotation(n - 1, n)).toBeGreaterThan(0);
      expect(fanRotation(0, n) + fanRotation(n - 1, n)).toBeCloseTo(0);
    }
  });

  it('keeps the rotation within +-25 * 0.875 degrees', () => {
    for (let i = 0; i < 10; i++) expect(Math.abs(fanRotation(i, 10))).toBeLessThanOrEqual(25 * 0.875);
  });

  it('is finite for a one-card hand (hsclone divided by zero there)', () => {
    expect(Number.isFinite(fanRotation(0, 1))).toBe(true);
    expect(Number.isFinite(fanDrop(0, 1))).toBe(true);
  });

  it('drops the ends lower than the middle, between 10 and 60px', () => {
    expect(fanDrop(0, 7)).toBeGreaterThan(fanDrop(3, 7));
    for (let i = 0; i < 10; i++) {
      expect(fanDrop(i, 10)).toBeGreaterThanOrEqual(10);
      expect(fanDrop(i, 10)).toBeLessThanOrEqual(60);
    }
  });

  it('zooms only when the overlapping row is wider than the room', () => {
    expect(handZoom(2000, 10, 144)).toBe(1);
    const n = 10;
    const needed = n * 144 - (n - 1) * HAND_OVERLAP;
    expect(handZoom(needed / 2, n, 144)).toBeCloseTo(0.5);
    expect(handZoom(0, n, 144)).toBe(1);
  });
});
