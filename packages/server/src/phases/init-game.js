import deckInfo from '../state/deck-info';
import players from '../state/players';
import playerHero from '../state/player-hero';
import playerName from '../state/player-name';
import playerHeroAbilities from '../state/player-hero-abilities';
const testDeck = require('../data/deck.default.001.json');
const testDeck1 = require('../data/deck.default.001.json');
const testDeck2 = require('../data/deck.default.002.json');

export default {
  // Start the match by initiating each player's deck from the
  // component (client-side) state into the G state.
  // @TODO fix later on for deck selection/lobby/etc
  onBegin: (G, ctx) => {
    const p1deck = testDeck1;
    const p2deck = testDeck2;

    players.setDeck(G, '0', ctx.random.Shuffle(p1deck));
    players.setDeck(G, '1', ctx.random.Shuffle(p2deck));

    deckInfo.set(G, '0', p1deck);
    deckInfo.set(G, '1', p2deck);

    playerHero.set(G, '0', '%HERO_EXILE%');
    playerHero.set(G, '1', '%HERO_ZEUS%');

    playerHeroAbilities.set(G, '0', '%HERO_EXILE%');
    playerHeroAbilities.set(G, '1', '%HERO_ZEUS%');

    playerName.set(G, '0', 'pantsme');
    playerName.set(G, '1', 'anotherPlayer');
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
