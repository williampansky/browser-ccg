import { Card, GameState, PlayerID } from '../../../../types';
import { getContextualPlayerIds } from '../../../../utils';

export const attackableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let attackableMinionsAvailable = false;

  const canBeAttacked = (c: Card) => {
    return c.booleans.canBeAttackedBySpell === false;
  }

  const isNotDestroyed = (c: Card) => {
    return c.booleans.isDestroyed === true;
  }

  G.zones.forEach((z, zi) => {
    // @todo future enhancement
    // z.sides[player].forEach((c) => {
    //   if (c.booleans.hasHealthReduced) attackableMinionsAvailable = true;
    // });

    z.sides[opponent].forEach((c) => {
      // if (c && !c.booleans.isDestroyed) attackableMinionsAvailable = true;
      console.log(c.name, c.booleans.canBeAttackedBySpell, c.booleans.isDestroyed)
      if (canBeAttacked(c) && isNotDestroyed(c)) {
        attackableMinionsAvailable = true;
      }
    });
  });

  return attackableMinionsAvailable;
};
