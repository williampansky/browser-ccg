import { Card, GameState } from '../../../../types';

/**
 * Sets all cards-in-hand to `canPlay: false`
 */
const unsetPlayableCardsInHand = (G: GameState): void => {
  const fn = (G: GameState, player: string): void => {
    G.players[player].cards.hand.forEach((c: Card) => (c.canPlay = false));
  };

  fn(G, '0')
  fn(G, '1')
};

export default unsetPlayableCardsInHand;
