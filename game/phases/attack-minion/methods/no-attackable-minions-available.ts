import { Card, GameState, PlayerID } from '../../../../types';
import { getContextualPlayerIds } from '../../../../utils';

export const noAttackableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noAttackableMinionsAvailable = true;

  const canBeAttacked = (c: Card) => {
    return c.booleans.canBeAttackedBySpell === true;
  }

  const isNotDestroyed = (c: Card) => {
    return c.booleans.isDestroyed === false;
  }

  G.zones.forEach((z, zi) => {
    // @todo future enhancement
    // z.sides[player].forEach((c) => {
    //   if (c.booleans.hasHealthReduced) noAttackableMinionsAvailable = false;
    // });

    z.sides[opponent].forEach((c) => {
      // if (c && !c.booleans.isDestroyed) noAttackableMinionsAvailable = false;
      console.log(c.name, c.booleans.canBeAttackedBySpell, c.booleans.isDestroyed)
      if (canBeAttacked(c) && isNotDestroyed(c)) {
        noAttackableMinionsAvailable = false;
      }
    });
  });

  return noAttackableMinionsAvailable;
};
