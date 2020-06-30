import counts from '../state/counts';

/**
 * Discard a single card from your deck into your `playedCards` array.
 * @param {object} G
 * @param {string} player
 * @requires counts.deincrementDeck()
 */
const discardCard = (G, ctx, player, amountToDiscard = 1) => {
  return amountToDiscard >= 2
    ? discardMultipleCards(G, player, amountToDiscard)
    : discardSingleCard(G, player);
};

// prettier-ignore
export const discardSingleCard = (G, player) => {
  counts.deincrementDeck(G, player); // ........... set counts[player].deck
  G.playedCards[player].push( // .................. pushes to playedCards
    G.players[player].deck.splice(0, 1)[0] // ..... splices from deck
  );
}

// prettier-ignore
export const discardCardFromHandByIndex = (G, player, index) => {
  counts.deincrementHand(G, player); // .............. set counts[player].deck
  G.playedCards[player].push( // ..................... pushes to playedCards
    G.players[player].hand.splice(index, 1)[0] // .... splices from deck
  );
}

export const discardMultipleCards = (G, player, amountToDiscard) => {
  for (let i = 0; i < amountToDiscard; i++) discardSingleCard(G, player);
};

export default discardCard;
