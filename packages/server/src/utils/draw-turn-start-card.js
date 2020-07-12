import discardCard from '../moves/discard-card';
import drawCard from '../moves/draw-card';
import playerHealth from '../state/player-health';

/**
 * Draws or discards a single card at the start of the current player's turn.
 *
 * @param {object} G
 * @param {object} ctx
 * @requires moves.drawCard
 * @requires moves.discardCard
 */
const drawCardAtStartOfTurn = (G, ctx) => {
  const { currentPlayer } = ctx;
  const currentPlayerDeckLength = G.players[currentPlayer].deck.length;
  const currentPlayerHandLength = G.players[currentPlayer].hand.length;
  const currentPlayerHasLessThan10Cards = currentPlayerHandLength < 10;

  if (currentPlayerHasLessThan10Cards) drawCard(G, ctx, currentPlayer);
  else discardCard(G, ctx, currentPlayer);

  if (currentPlayerDeckLength === 0) {
    const positiveInteger = Math.abs(G.counts[currentPlayer].deck);
    playerHealth.subtract(G, currentPlayer, positiveInteger);
  }
};

export default drawCardAtStartOfTurn;
