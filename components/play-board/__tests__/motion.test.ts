import { flightFrames, IMPACT_MS, lungeFrames } from '../motion';

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

describe('flightFrames', () => {
  const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height }) as DOMRect;
  const frames = flightFrames(rect(0, 400, 144, 202), rect(300, 100, 80, 100));
  it('ends centred on the minion, shrunk to its size', () => {
    // centres: (72, 501) -> (340, 150)
    expect(String(frames[frames.length - 1].transform)).toMatch(/translate\(268px, -351px\) scale\(0\.55/);
  });
  it('rises a little before it swoops in', () => {
    expect(String(frames[1].transform)).toMatch(/scale\(1\.08\)/);
  });
});
