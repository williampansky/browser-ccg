import { Card, GameState, PlayerID } from '../types';
import { cardIsNotSelf, getContextualPlayerIds } from '.';

const determineDestroyableMinions = (G: GameState, player: PlayerID) => {
  const { playedCards } = G;
  const { opponent } = getContextualPlayerIds(player);
  const lastPlayedCard = playedCards[player][playedCards[player].length - 1];

  const cardIsNotDestroyed = (c: Card) => {
    return c.booleans.isDestroyed === false;
  };

  G.zones.forEach((z) => {
    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, lastPlayedCard) && cardIsNotDestroyed(c)) {
        c.booleans.canBeDestroyed = true;
      }
    });
  });
};

export default determineDestroyableMinions;
