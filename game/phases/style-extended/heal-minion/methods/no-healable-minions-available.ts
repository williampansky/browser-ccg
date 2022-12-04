import { GameState, PlayerID } from '../../../../../types';
import { getContextualPlayerIds } from '../../../../../utils';

export const noHealableMinionsAvailable = (
  G: GameState,
  player: PlayerID
): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noHealableMinionsAvailable = true;

  G.zones.forEach((z, zi) => {
    z.sides[player].forEach((c) => {
      if (c.booleans.hasHealthReduced) noHealableMinionsAvailable = false;
    });

    z.sides[opponent].forEach((c) => {
      if (c.booleans.hasHealthReduced) noHealableMinionsAvailable = false;
    });
  });

  return noHealableMinionsAvailable;
};
