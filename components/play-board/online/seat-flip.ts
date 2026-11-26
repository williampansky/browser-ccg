import type { PlayerId } from '../../../engine';

const SWAPPED_KEYS = ['players', 'played'];
/** Properties that hold a player id (`loan.from` is one, checked below). */
const SEAT_FIELDS = ['player', 'winner', 'activePlayer', 'from'];

const swapSeat = (value: unknown): unknown =>
  value === '0' ? '1' : value === '1' ? '0' : value;

/**
 * The same state, event or action with the two seats exchanged. The board
 * assumes "me" is seat 0, so a player who sits in seat 1 gets everything
 * flipped on the way in and flipped back on the way out. Flipping twice gives
 * the original. Instance ids and card ids are untouched.
 */
export const flipSeats = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(flipSeats) as unknown as T;
  if (typeof value !== 'object' || value === null) return value;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  Object.keys(source).forEach((key) => {
    const child = source[key];
    if (SWAPPED_KEYS.includes(key) && typeof child === 'object' && child) {
      const record = child as Record<string, unknown>;
      out[key] = { '0': flipSeats(record['1']), '1': flipSeats(record['0']) };
    } else if (SEAT_FIELDS.includes(key)) out[key] = swapSeat(child);
    else out[key] = flipSeats(child);
  });

  return out as T;
};

/** `value` as the player in `seat` should see it: unchanged for seat 0. */
export const forSeat = <T>(value: T, seat: PlayerId): T =>
  seat === '0' ? value : flipSeats(value);
