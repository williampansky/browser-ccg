import counts from '../state/counts';
import deckInfo from '../state/deck-info';
import discardCard from './discard-card';
import getCardByID from '../utils/get-card-by-id';
import playerHealth from '../state/player-health';

/**
 * Draw a card from player's deck to their hand.
 *
 * @param {{}} G
 * @param {string} player
 * @param {number} amountToDraw number of cards to draw
 * @requires counts.deincrementDeck()
 * @requires counts.incrementHand()
 */
const drawCard = (G, ctx, player, amountToDraw = 1) => {
  if (amountToDraw === 0) return;
  return amountToDraw >= 2
    ? drawMultipleCards(G, ctx, player, amountToDraw)
    : drawSingleCard(G, ctx, player);
};

// prettier-ignore
export const drawSingleCard = (G, ctx, player) => {
  const playerDeckLength = G.players[player].deck.length;
  const playerHandLength = G.players[player].hand.length;
  const playerHasLessThan10Cards = playerHandLength <= 10;

  if (playerHasLessThan10Cards) {
    counts.deincrementDeck(G, player); // ............. set counts[player].deck
    counts.incrementHand(G, player); // ............... set counts[player].hand

    // sets deck info based on card drawn
    if (G.players[player].deck.includes(G.players[player].deck[0])) {
      deckInfo.changeAmount(G, player, G.players[player].deck[0], 1);
    } else {
      deckInfo.changeAmount(G, player, G.players[player].deck[0], 0);
    }
    
    G.players[player].hand.push( // ................... pushes to hand
      getCardByID( // ................................. generates card object
        G.players[player].deck.splice(0, 1)[0] // ..... splices from deck
      )
    );
  } else {
    discardCard(G, ctx, player);
  }

  if (playerDeckLength === 0) {
    const positiveInteger = Math.abs(G.counts[player].deck);
    playerHealth.subtract(G, player, positiveInteger);
  }
}

// prettier-ignore
export const drawSpecificCard = (G, ctx, player, cardId) => {
  const playerDeckLength = G.players[player].deck.length;
  const playerHandLength = G.players[player].hand.length;
  const playerHasLessThan10Cards = playerHandLength <= 10;

  if (playerHasLessThan10Cards) {
    counts.deincrementDeck(G, player); // ............. set counts[player].deck
    counts.incrementHand(G, player); // ............... set counts[player].hand

    // sets deck info based on card drawn
    if (G.players[player].deck.includes(G.players[player].deck[0])) {
      deckInfo.changeAmount(G, player, G.players[player].deck[0], 1);
    } else {
      deckInfo.changeAmount(G, player, G.players[player].deck[0], 0);
    }
    
    G.players[player].hand.push( // ................... pushes to hand
      getCardByID( // ................................. generates card object
        cardId // ..................................... card by id
      )
    );

    const newDeck = G.players[player].deck.filter(str => str !== cardId);
    G.players[player].deck = newDeck;
  } else {
    discardCard(G, ctx, player);
  }

  if (playerDeckLength === 0) {
    const positiveInteger = Math.abs(G.counts[player].deck);
    playerHealth.subtract(G, player, positiveInteger);
  }
}

export const drawMultipleCards = (G, ctx, player, amountToDraw) => {
  for (let i = 0; i < amountToDraw; i++) drawSingleCard(G, ctx, player);
};

export default drawCard;
