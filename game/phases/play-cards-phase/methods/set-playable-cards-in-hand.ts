import { Card, GameState } from '../../../../types';

/**
 * Checks each card in the player's hand and sets `canPlay: true`
 * to applicable cards based on the card's cost -vs- current AP.
 */
const setPlayableCardsInHand = (G: GameState) => {
  const fn = (G: GameState, player: string): void => {
    if (G.players[player].cards.hand.length !== 0) {
      G.players[player].cards.hand.forEach((c: Card) => {
        if (G.actionPoints[player].current >= c.currentCost) {
          return (c.canPlay = true);
        } else {
          return (c.canPlay = false);
        }
      });
    }
  };

  fn(G, '0');
  fn(G, '1');
};

export default setPlayableCardsInHand;
