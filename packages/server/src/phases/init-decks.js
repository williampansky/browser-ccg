import deckInfo from '../state/deck-info';
import playerHero from '../state/player-hero';
import players from '../state/players';
const testDeck = require('../data/deck.default.001.json');

export default {
  // Start the match by initiating each player's deck from the
  // component (client-side) state into the G state.
  // @TODO fix later on for deck selection/lobby/etc
  onBegin: (G, ctx) => {
    const p1deck = testDeck;
    const p2deck = testDeck;

    players.setDeck(G, '0', ctx.random.Shuffle(p1deck));
    players.setDeck(G, '1', ctx.random.Shuffle(p2deck));

    deckInfo.set(G, '0', p1deck);
    deckInfo.set(G, '1', p2deck);

    playerHero.set(G, '0', '%HERO_EXILE%');
    playerHero.set(G, '1', '%HERO_ZEUS%');
  },

  // End phase when both player's decks are full (30 cards)
  // prettier-ignore
  endIf: (G, ctx) => (
    G.players[ctx.playOrder['0']].deck.length === 30 &&
    G.players[ctx.playOrder['1']].deck.length === 30
  ),

  start: true,
  next: 'initHandsPhase'
};
