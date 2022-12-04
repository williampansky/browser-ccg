import { Card, GameState, PlayerID } from '../../../../types';
import { cardIsNotSelf, getContextualPlayerIds } from '../../../../utils';

export const determineDestroyableMinions = (G: GameState, player: PlayerID) => {
  const { playedCards } = G;
  const { opponent } = getContextualPlayerIds(player);
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];

  const cardIsNotDestroyed = (c: Card) => {
    return c.booleans.isDestroyed === false;
  };

  G.zones.forEach((z) => {
    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, lastPlayedCard) && cardIsNotDestroyed(c)) {
        switch (lastPlayedCard.key) {
          case 'SET_CORE_126':
            if (c.booleans.hasHealthReduced) c.booleans.canBeDestroyed = true;
            break;
          default:
            c.booleans.canBeDestroyed = true;
            break;
        }
      }
    });
  });
};
