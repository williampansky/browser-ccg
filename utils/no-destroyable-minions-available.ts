import { GameState, PlayerID } from '../types';
import { getContextualPlayerIds } from '../utils';

const noDestroyableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noDestroyableMinionsAvailable = true;

  G.zones.forEach((z, zi) => {
    // @todo future enhancement
    // z.sides[player].forEach((c) => {
    //   if (c.booleans.hasHealthReduced) noDestroyableMinionsAvailable = false;
    // });

    z.sides[opponent].forEach((c) => {
      const canBeDestroyed = c.booleans.canBeDestroyed === true;
      const isNotDestroyed = c.booleans.isDestroyed === false;

      if (canBeDestroyed || isNotDestroyed) {
        noDestroyableMinionsAvailable = false;
      }
    });
  });

  return noDestroyableMinionsAvailable;
};

export default noDestroyableMinionsAvailable;
