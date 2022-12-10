import { GameState, PlayerID } from '../types';
import { counts } from '../game/state';
import getRandomNumberBetween from './get-random-number-between';

/**
 * Draws the `amountToDraw` of cards from the provided `player` param's deck
 * and pushes it to their hand; also handles `G.Counts`.
 *
 * Can also provide optional param to draw a random card,
 * instead of just the next in line.
 */
const drawCardFromPlayersDeck = (
  G: GameState,
  player: PlayerID,
  amountToDraw: number = 1,
  drawContext?: 'next' | 'random' | string
): void => {
  const maxHandSize = G.gameConfig.numerics.cardsPerHand;

  for (let i = 0; i < amountToDraw; i++) {
    if (G.players[player].cards.hand.length < maxHandSize) {
      if (G.players[player].cards.deck.length !== 0) {
        switch (drawContext) {
          case 'random':
            G.players[player].cards.hand.push(
              G.players[player].cards.deck.splice(
                getRandomNumberBetween(
                  0,
                  G.players[player].cards.deck.length - 1
                ),
                1
              )[0]
            );
            break;

          case 'next':
          default:
            G.players[player].cards.hand.push(
              G.players[player].cards.deck.splice(0, 1)[0]
            );
            break;
        }
      }

      counts.incrementHand(G, player);
      counts.decrementDeck(G, player);
    }
  }
};

export default drawCardFromPlayersDeck;
