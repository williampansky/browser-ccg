import { fanDrop, fanRotation, HAND_CARD_HEIGHT, handSink, handZoom, HAND_OVERLAP } from '../hand-fan';

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

  describe('handSink', () => {
    // On screen, the card tops end up at (rowBottom - cardHeight * zoom) + sink * zoom.
    const topOnScreen = (rowBottom: number, zoom: number, sink: number) => rowBottom - HAND_CARD_HEIGHT * zoom + sink * zoom;

    it('shows `peek` px of the cards when there is room, whatever the zoom', () => {
      for (const zoom of [1, 0.66, 0.4]) {
        const rowBottom = 700; // row bottom at the window's bottom edge: the wanted sink is under the cap at these zooms
        const sink = handSink(700, rowBottom, zoom, 110);
        expect(700 - topOnScreen(rowBottom, zoom, sink)).toBeCloseTo(110, -1);
      }
    });

    it('caps the sink at 100 px on screen on a tall window', () => {
      expect(handSink(2000, 700, 1, 110)).toBe(100);
      const sink = handSink(2000, 700, 0.5, 110);
      expect(sink * 0.5).toBeCloseTo(100, 0);
    });

    it('goes negative on a short window so the cards rise into view', () => {
      expect(handSink(560, 700, 1, 110)).toBeLessThan(0); // row bottom below the window: cards must rise
    });

    it('keeps a shrunken hand on screen: the row bottom, not the row top, decides (flex-end)', () => {
      // A 10-card hand at zoom 0.26 in a 800px window whose row bottom is at 840: the old row-top maths put the cards offscreen.
      const sink = handSink(800, 840, 0.26, 110);
      expect(topOnScreen(840, 0.26, sink)).toBeLessThan(800);
    });
  });
});
