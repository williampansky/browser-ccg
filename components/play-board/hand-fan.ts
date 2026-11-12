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

/** The height of a card in hand at full size (1 : 1.4 of the 144px width, rounded as in the CSS). */
export const HAND_CARD_HEIGHT = 202;

/** The most the cards sink below their fan position, in px as seen on screen (hsclone's hand shows only their tops). */
const MAX_VISIBLE_SINK = 100;

/**
 * How far (CSS px, unzoomed: the hand's `zoom` scales translate lengths too) to sink the cards so `peek` px of their tops
 * show above the bottom edge of the window. The cards sit at the bottom of the row and shrink with the zoom, so their top
 * is `rowBottom - cardHeight * zoom`, not the row's top. Capped at 100px on screen; negative on a short window, where the
 * cards must rise instead so they never vanish offscreen.
 */
export const handSink = (windowHeight: number, rowBottom: number, zoom: number, peek: number): number => {
  const cardsTop = rowBottom - HAND_CARD_HEIGHT * zoom;
  const wanted = (windowHeight - peek - cardsTop) / zoom;
  return Math.round(Math.min(MAX_VISIBLE_SINK / zoom, Math.max(-120, wanted)));
};
