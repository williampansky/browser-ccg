import { flightFrames } from '../motion';

describe('flightFrames', () => {
  const rect = (left: number, top: number, width: number, height: number) =>
    ({ left, top, width, height }) as DOMRect;
  const frames = flightFrames(rect(0, 400, 144, 202), rect(300, 100, 80, 100));
  it('ends centred on the minion, shrunk to its size', () => {
    // centres: (72, 501) -> (340, 150)
    expect(String(frames[frames.length - 1].transform)).toMatch(
      /translate\(268px, -351px\) scale\(0\.55/,
    );
  });
  it('rises a little before it swoops in', () => {
    expect(String(frames[1].transform)).toMatch(/scale\(1\.08\)/);
  });
});
