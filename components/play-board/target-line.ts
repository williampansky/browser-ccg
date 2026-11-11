export type Point = { x: number; y: number };

/** How the targeting line is drawn. Both are kept; change `TARGET_LINE_STYLE` in PlayBoard to switch. */
export type TargetLineStyle = 'curve' | 'straight';

/** How far the curve bows, as a fraction of the line's length, but never less than MIN_BOW pixels so short lines still arc. */
const BOW = 0.25;
const MIN_BOW = 70;
/** Straight-ish (steep) lines bow much less than the rest, as a fraction of length with a small floor in pixels. */
const STEEP_BOW = 0.08;
const STEEP_MIN_BOW = 14;
/** A line this close to vertical (|dx| / length) always bows to the same side, so it does not flip left and right. */
const STEEP = 0.2;

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
  // Nearly vertical: pick one fixed side instead of letting the sign of a tiny dx decide.
  if (Math.abs(dx) < len * STEEP) {
    nx = -Math.sqrt(1 - ny * ny);
  }
  const steep = Math.abs(dx) < len * STEEP;
  const bow = steep ? Math.max(len * STEEP_BOW, STEEP_MIN_BOW) : Math.max(len * BOW, MIN_BOW);
  const cx = (from.x + to.x) / 2 + nx * bow;
  const cy = (from.y + to.y) / 2 + ny * bow;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
};
