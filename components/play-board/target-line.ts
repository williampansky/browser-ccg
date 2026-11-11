export type Point = { x: number; y: number };

/** How the targeting line is drawn. Both are kept; change `TARGET_LINE_STYLE` in PlayBoard to switch. */
export type TargetLineStyle = 'curve' | 'straight';

/** How far the curve bows, as a fraction of the line's length. */
const BOW = 0.25;

/**
 * The SVG path from `from` to `to`. `straight` is a plain line. `curve` is a quadratic bezier whose
 * control point sits to one side of the midpoint, always the upward side (so the arc rises like a
 * thrown card); for a vertical line, which has no upward side, it bows to the left.
 */
export const targetLinePath = (from: Point, to: Point, style: TargetLineStyle): string => {
  if (style === 'straight') return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  // A unit normal to the line, flipped so it points up (negative y), or left when the line is vertical.
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0 || (ny === 0 && nx > 0)) {
    nx = -nx;
    ny = -ny;
  }
  const cx = (from.x + to.x) / 2 + nx * len * BOW;
  const cy = (from.y + to.y) / 2 + ny * len * BOW;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
};
