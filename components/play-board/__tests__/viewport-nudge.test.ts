import { viewportShift } from '../viewport-nudge';

const vp = { width: 1000, height: 800 };
const box = (left: number, top: number, w: number, h: number) => ({
  left,
  top,
  right: left + w,
  bottom: top + h,
});

describe('viewportShift', () => {
  it('leaves a box that fits alone', () => {
    expect(viewportShift(box(100, 100, 200, 50), vp)).toEqual({ dx: 0, dy: 0 });
  });
  it('pulls a box back from the right and bottom edges, keeping the margin', () => {
    expect(viewportShift(box(900, 780, 200, 50), vp, 8)).toEqual({
      dx: -108,
      dy: -38,
    });
  });
  it('pulls a box back from the left and top edges', () => {
    expect(viewportShift(box(-50, -20, 200, 50), vp, 8)).toEqual({
      dx: 58,
      dy: 28,
    });
  });
  it('pins the start of a box that is bigger than the window', () => {
    expect(viewportShift(box(-30, 0, 1200, 50), vp, 8)).toEqual({
      dx: 38,
      dy: 8,
    });
  });
});
