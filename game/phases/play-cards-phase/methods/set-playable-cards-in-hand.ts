import { Card, GameState, PlayerID } from '../../../../types';

/**
 * Checks each card in the player's hand and sets `canPlay: true`
 * to applicable cards based on the card's cost -vs- current AP.
 */
const setPlayableCardsInHand = (G: GameState, player?: PlayerID) => {
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

  if (player) {
    fn(G, player);
  } else {
    fn(G, '0');
    fn(G, '1');
  }
};

export default setPlayableCardsInHand;
