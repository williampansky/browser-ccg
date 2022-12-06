import { Card, GameState, PlayerID } from '../../../../types';
import { getContextualPlayerIds } from '../../../../utils';

export const noBuffableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noBuffableMinionsAvailable = true;

  const canBeBuffed = (c: Card) => {
    return c.booleans.canBeBuffed === true;
  }

  const isNotDestroyed = (c: Card) => {
    return c.booleans.isDestroyed === false;
  }

  G.zones.forEach((z, zi) => {
    // @todo future enhancement
    // z.sides[opponent].forEach((c) => {
    //   if (c.booleans.hasHealthReduced) noBuffableMinionsAvailable = false;
    // });

    z.sides[player].forEach((c) => {
      console.log(c.name, c.booleans.canBeBuffed, c.booleans.isDestroyed)
      if (canBeBuffed(c) && isNotDestroyed(c)) {
        noBuffableMinionsAvailable = false;
      }
    });
  });

  return noBuffableMinionsAvailable;
};
