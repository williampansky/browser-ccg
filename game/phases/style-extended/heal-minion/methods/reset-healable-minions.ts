import { GameState, PlayerID } from '../../../../../types';
import { getContextualPlayerIds } from '../../../../../utils';

interface Props {
  G: GameState;
  player: PlayerID;
}

export const resetHealableMinions = ({ G, player }: Props) => {
  const { opponent } = getContextualPlayerIds(player);
  
  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      c.booleans.canBeHealed = false;
    });

    z.sides[opponent].forEach((c) => {
      c.booleans.canBeHealed = false;
    });
  });
};
