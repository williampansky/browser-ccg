import { GameState, PlayerID } from '../../../../types';
import { cardIsNotSelf, getContextualPlayerIds } from '../../../../utils';

export const determineAttackableMinions = (G: GameState, player: PlayerID) => {
  const { playedCards } = G;
  const { opponent } = getContextualPlayerIds(player);
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];

  G.zones.forEach((z) => {
    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, lastPlayedCard) && c.booleans.hasHealthReduced) {
        c.booleans.canBeAttackedBySpell = true;
      }
    });

    // @todo future enhancement
    // z.sides[player].forEach((c) => {
    //   if (cardIsNotSelf(c, lastPlayedCard) && c.booleans.hasHealthReduced) {
    //     c.booleans.canBeHealed = true;
    //   }
    // });
  });

  // selectedCardData.reset(G, player);
  // selectedCardIndex.reset(G, player);
};
