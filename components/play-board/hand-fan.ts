/**
 * The fan of the hand: how far each card is rotated and dropped, ported from hsclone's `CardInteraction`
 * (`calcRotate` / `calcOffset`) with the same constants. hsclone used `numberOfCards + 1` as the total, which
 * leaned the fan to one side (it had a placeholder card in the hand); here the fan is centred on the hand, which
 * gives hsclone's numbers for a full hand. The divisor is clamped to 1 (hsclone divided by 0 for one card).
 */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Rotation in degrees of the card at `index` in a hand of `count` cards (0 = leftmost). */
export const fanRotation = (index: number, count: number): number => {
  const raw = ((index - (count - 1) / 2) / Math.max(count - 1, 1)) * 50;
  return clamp(raw, -25, 25) * 0.875;
};

/** How far down (px, at full card size) the card sits: the ends drop, the middle stays high. */
export const fanDrop = (index: number, count: number): number => {
  const raw = Math.abs(((index - (count - 1) / 2) / Math.max(count - 1, 1)) * 80);
  return clamp(raw, 10, 60);
};

/** How much neighbouring cards overlap, in px at full card size (hsclone overlapped about 38% of a card). */
export const HAND_OVERLAP = 48;

/** Zoom so `count` overlapping cards of `cardWidth` fit `width` px on one row (never above 1). */
export const handZoom = (width: number, count: number, cardWidth: number): number => {
  if (width <= 0 || count <= 0) return 1;
  const needed = count * cardWidth - (count - 1) * HAND_OVERLAP;
  return Math.min(1, width / needed);
};
