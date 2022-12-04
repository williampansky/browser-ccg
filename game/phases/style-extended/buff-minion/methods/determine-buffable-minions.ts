import { GameState, PlayerID } from '../../../../../types';
import { cardIsNotSelf, getContextualPlayerIds } from '../../../../../utils';
import { selectedCardData, selectedCardIndex } from '../../../../state';

export const determineBuffableMinions = (G: GameState, player: PlayerID) => {
  const { playedCards } = G;
  const { opponent } = getContextualPlayerIds(player);
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardIsNotSelf(c, lastPlayedCard)) {
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
