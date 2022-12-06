import { GameState, PlayerID } from '../types';
import { cardIsNotSelf, getContextualPlayerIds } from '.';

const determineBuffableMinions = (G: GameState, player: PlayerID) => {
  const { opponent } = getContextualPlayerIds(player);
  const lastCardPlayed = G.lastCardPlayed.card!;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardIsNotSelf(c, lastCardPlayed)) {
        c.booleans.canBeBuffed = true;
      }
    });

    // @todo future enhancement
    // z.sides[opponent].forEach((c) => {
    //   if (cardIsNotSelf(c, lastPlayedCard)) {
    //     c.booleans.canBeHealed = true;
    //   }
    // });
  });

  // selectedCardData.reset(G, player);
  // selectedCardIndex.reset(G, player);
};

export default determineBuffableMinions;
