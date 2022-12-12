import { Card, GameState, PlayerID } from '../types';
import { getContextualPlayerIds } from '.';

const noDebuffableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noDebuffableMinionsAvailable = true;

  const canBeDebuffed = (c: Card) => {
    return c.booleans.canBeDebuffed === true;
  };

  const isNotDestroyed = (c: Card) => {
    return c.booleans.isDestroyed === false;
  };

  G.zones.forEach((z, zi) => {
    z.sides[player].forEach((c) => {
      console.log(c.name, c.booleans.canBeDebuffed, c.booleans.isDestroyed);
      if (canBeDebuffed(c) && isNotDestroyed(c)) {
        noDebuffableMinionsAvailable = false;
      }
    });

    z.sides[opponent].forEach((c) => {
      console.log(c.name, c.booleans.canBeDebuffed, c.booleans.isDestroyed);
      if (canBeDebuffed(c) && isNotDestroyed(c)) {
        noDebuffableMinionsAvailable = false;
      }
    });
  });

  return noDebuffableMinionsAvailable;
};

export default noDebuffableMinionsAvailable;
