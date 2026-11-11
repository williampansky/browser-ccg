import { targetLinePath } from '../target-line';

const A = { x: 0, y: 100 };
const B = { x: 200, y: 100 };

describe('targetLinePath', () => {
  it('straight is a plain line from A to B', () => {
    expect(targetLinePath(A, B, 'straight')).toBe('M 0 100 L 200 100');
  });
  it('curve is a quadratic bezier from A to B', () => {
    expect(targetLinePath(A, B, 'curve')).toMatch(/^M 0 100 Q [\d.-]+ [\d.-]+ 200 100$/);
  });
  it('the curve bows upward (smaller y), whichever way the line points', () => {
    const control = (from: typeof A, to: typeof B) => {
      const m = targetLinePath(from, to, 'curve').match(/Q ([\d.-]+) ([\d.-]+)/)!;
      return { x: Number(m[1]), y: Number(m[2]) };
    };
    expect(control(A, B).y).toBeLessThan(100);
    expect(control(B, A).y).toBeLessThan(100); // right to left bows up too
    const vertical = control({ x: 50, y: 0 }, { x: 50, y: 300 });
    expect(vertical.y).toBeCloseTo(150, 0); // vertical line: no upward component, bows sideways
    expect(vertical.x).not.toBe(50);
  });
  it('a zero-length line does not produce NaN', () => {
    expect(targetLinePath(A, A, 'curve')).not.toContain('NaN');
  });
});
