import { GameState, PlayerID } from '../types';
import { getContextualPlayerIds } from '../utils';

const resetBuffableMinions = (G: GameState, player: PlayerID) => {
  const { opponent } = getContextualPlayerIds(player);

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      c.booleans.canBeBuffed = false;
    });

    z.sides[opponent].forEach((c) => {
      c.booleans.canBeBuffed = false;
    });
  });
};

export default resetBuffableMinions;
