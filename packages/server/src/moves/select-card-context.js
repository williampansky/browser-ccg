import selectedCardInteractionContext from '../state/selected-card-interaction-context';

/**
 * Sets the `selectedCardIndex` and `selectedCardObject`
 * of the current player's card.
 *
 * @param {object} G
 * @param {object} ctx
 * @param {string} contextString
 */
const selectCardContext = (G, ctx, contextString = null) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  selectedCardInteractionContext.set(G, currentPlayer, contextString);

  if (contextString === null) return;
};

export default selectCardContext;
