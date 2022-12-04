import { GameState, PlayerID } from '../../../../types';
import { getContextualPlayerIds } from '../../../../utils';

export const resetAttackableMinions = (G: GameState, player: PlayerID) => {
  const { opponent } = getContextualPlayerIds(player);
  
  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      c.booleans.canBeAttackedBySpell = false;
    });

    z.sides[opponent].forEach((c) => {
      c.booleans.canBeAttackedBySpell = false;
    });
  });
};
