import { GameState, PlayerID } from '../../../../../types';
import { getContextualPlayerIds } from '../../../../../utils';

interface Props {
  G: GameState;
  player: PlayerID;
}

export const noHealableMinionsAvailable = ({ G, player }: Props): boolean => {
  const { opponent } = getContextualPlayerIds(player);
  let noHealableMinionsAvailable = true;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (c.booleans.hasHealthReduced) noHealableMinionsAvailable = false;
    });

    z.sides[opponent].forEach((c) => {
      if (c.booleans.hasHealthReduced) noHealableMinionsAvailable = false;
    });
  });

  return noHealableMinionsAvailable;
};
