import { IMPACT_MS, lungeFrames } from '../motion';

describe('lungeFrames', () => {
  const frames = lungeFrames({ x: 100, y: 0 });
  it('starts and ends at rest', () => {
    expect(frames[0].transform).toBe('translate(0px, 0px) scale(1)');
    expect(frames[frames.length - 1].transform).toBe('translate(0px, 0px) scale(1)');
  });
  it('pulls back from the target first (a wind-up), then strikes toward it', () => {
    expect(String(frames[1].transform)).toMatch(/translate\(-14px/);
    expect(String(frames[2].transform)).toMatch(/translate\(82px/);
  });
  it('hits at IMPACT_MS of a 520ms swing, which the target shake and damage numbers wait for', () => {
    expect(frames[2].offset).toBeCloseTo(IMPACT_MS / 520);
  });
  it('keeps offsets in increasing order', () => {
    const offs = frames.map((f) => f.offset as number);
    expect([...offs].sort((a, b) => a - b)).toEqual(offs);
  });
});
