import { GameState, PlayerID } from '../types';
import { counts } from '../game/state';

/**
 * Draws the `amountToDraw` of cards from the provided `player` param's deck
 * and pushes it to their hand; also handles `G.Counts`
 */
const drawCardFromPlayersDeck = (
  G: GameState,
  player: PlayerID,
  amountToDraw: number = 1
): void => {
  const maxHandSize = G.gameConfig.numerics.cardsPerHand;

  // prettier-ignore
  for (let i = 0; i < amountToDraw; i++) {
    if (G.players[player].cards.hand.length < maxHandSize) { // ...... can draw
      if (G.players[player].cards.deck.length !== 0) { // ............ to draw exists
        G.players[player].cards.hand.push( // ........................ pushes to hand
          G.players[player].cards.deck.splice(0, 1)[0] // ............ splices from deck
        );
        
        counts.incrementHand(G, player); // .................... count hand
        counts.decrementDeck(G, player); // .................... count deck
      }
    }
  }
};

export default drawCardFromPlayersDeck;
