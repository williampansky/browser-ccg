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
