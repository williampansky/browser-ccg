import { MAX_ENERGY, MAX_HEALTH } from '../../engine';

/** One energy slot: ready to spend, already spent this turn, a bonus slot (the Orb), or not unlocked yet. */
export type PipState = 'ready' | 'spent' | 'bonus' | 'locked';

/**
 * The row of energy slots for a hero bar. `total` slots are unlocked; `current` of them are still available. `current`
 * can exceed `total` (The Orb gives an extra point for the turn), shown as `bonus` slots after the unlocked ones.
 */
export const energyPips = (current: number, total: number, max: number = MAX_ENERGY): PipState[] =>
  Array.from({ length: max }, (_, i) => {
    if (i < total) return i < current ? 'ready' : 'spent';
    return i < current ? 'bonus' : 'locked';
  });

/** Health as 0..1 for the ring around the avatar. */
export const healthFraction = (health: number, max: number = MAX_HEALTH): number =>
  max <= 0 ? 0 : Math.max(0, Math.min(1, health / max));

export type HealthTone = 'healthy' | 'hurt' | 'critical';

/** Colour band of the ring and the number: green above half, amber above a quarter, red below. */
export const healthTone = (fraction: number): HealthTone => (fraction > 0.5 ? 'healthy' : fraction > 0.25 ? 'hurt' : 'critical');
