import { GameState, PlayerID } from '../types';
import { cardIsNotSelf, getContextualPlayerIds } from '.';

const determineDebuffableMinions = (G: GameState, player: PlayerID) => {
  const { opponent } = getContextualPlayerIds(player);
  const lastCardPlayed = G.lastCardPlayed.card!;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardIsNotSelf(c, lastCardPlayed)) {
        c.booleans.canBeDebuffed = true;
      }
    });

    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, lastCardPlayed)) {
        c.booleans.canBeDebuffed = true;
      }
    });
  });
};

export default determineDebuffableMinions;
