import { GameState, PlayerID } from '../types';
import { getContextualPlayerIds } from '../utils';

const resetHealableMinions = (G: GameState, player: PlayerID) => {
  const { opponent } = getContextualPlayerIds(player);

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      c.booleans.canBeHealed = false;
      c.booleans.wasHealed = false;
    });

    z.sides[opponent].forEach((c) => {
      c.booleans.canBeHealed = false;
      c.booleans.wasHealed = false;
    });
  });
};

export default resetHealableMinions;
