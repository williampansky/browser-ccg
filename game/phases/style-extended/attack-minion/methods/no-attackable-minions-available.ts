import { GameState, PlayerID } from '../../../../../types';
import { getContextualPlayerIds } from '../../../../../utils';

export const noAttackableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noAttackableMinionsAvailable = true;

  G.zones.forEach((z, zi) => {
    // @todo future enhancement
    // z.sides[player].forEach((c) => {
    //   if (c.booleans.hasHealthReduced) noAttackableMinionsAvailable = false;
    // });

    z.sides[opponent].forEach((c) => {
      if (c && !c.booleans.isDestroyed) noAttackableMinionsAvailable = false;
    });
  });

  return noAttackableMinionsAvailable;
};
