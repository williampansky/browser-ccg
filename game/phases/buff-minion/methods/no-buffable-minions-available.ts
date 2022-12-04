import { GameState, PlayerID } from '../../../../types';
import { getContextualPlayerIds } from '../../../../utils';

export const noBuffableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noBuffableMinionsAvailable = true;

  G.zones.forEach((z, zi) => {
    // @todo future enhancement
    // z.sides[player].forEach((c) => {
    //   if (c.booleans.hasHealthReduced) noBuffableMinionsAvailable = false;
    // });

    z.sides[opponent].forEach((c) => {
      if (c && !c.booleans.isDestroyed) noBuffableMinionsAvailable = false;
    });
  });

  return noBuffableMinionsAvailable;
};
