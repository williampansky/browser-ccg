import type { PlayerId } from '../../engine';

import type { SpellFxTune } from './spell-fx-tune';

/**
 * The sides whose minions a spot effect plays on for this anchor, seen from
 * the player who cast the spell. `target` is not about minions, so it has none
 * (the effect plays on the spell's target or the caster's hero instead).
 */
export const spotSides = (
  anchor: SpellFxTune['spotAnchor'],
  caster: PlayerId,
): PlayerId[] => {
  const foe: PlayerId = caster === '0' ? '1' : '0';

  if (anchor === 'my-minions') return [caster];
  if (anchor === 'enemy-minions') return [foe];
  if (anchor === 'all-minions') return ['0', '1'];

  return [];
};

/**
 * The width of the minion the spot effects are tuned on in the spells lab
 * (px). The lab's numbers (reach, shifts, sizes) are pixels on a minion this
 * wide; on the board they are scaled by the real minion's width over this.
 */
export const SPOT_REFERENCE_MINION_WIDTH = 128;

/** How much to scale a spot's pixel numbers for the thing it plays on. */
export const spotScaleFor = (isMinion: boolean, width: number): number => {
  if (!isMinion || width <= 0) return 1;

  return width / SPOT_REFERENCE_MINION_WIDTH;
};

/** The spot numbers that are pixels on the target, so they follow its size. */
const SCALED_SPOT_FIELDS = [
  'spotDescendEnd',
  'spotDescendEndRadius',
  'spotDescendEndX',
  'spotDescendStart',
  'spotDescendStartX',
  'spotGlowScale',
  'spotRadius',
  'spotSparkSpread',
  'spotSpriteRise',
  'spotWidth',
  'spriteSize',
] as const;

/** A copy of the tune with its spot pixel numbers scaled (or the tune itself at 1). */
export const scaleSpotTune = (
  tune: SpellFxTune,
  scale: number,
): SpellFxTune => {
  if (scale === 1) return tune;
  const scaled = { ...tune };

  SCALED_SPOT_FIELDS.forEach((field) => {
    scaled[field] = tune[field] * scale;
  });

  return scaled;
};
