import { GameState, PlayerID } from '../types';
import { getContextualPlayerIds } from '../utils';

const noDestroyableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noDestroyableMinionsAvailable = true;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      console.log(player, c.name, c.booleans.canBeDestroyed, c.booleans.isDestroyed);
      const canBeDestroyed = c.booleans.canBeDestroyed === true;
      const isNotDestroyed = c.booleans.isDestroyed === false;

      if (canBeDestroyed || isNotDestroyed) {
        noDestroyableMinionsAvailable = false;
      }
    });

    z.sides[opponent].forEach((c) => {
      console.log(opponent, c.name, c.booleans.canBeDestroyed, c.booleans.isDestroyed);
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
