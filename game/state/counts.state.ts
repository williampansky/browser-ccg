import { add, subtract } from 'mathjs';
import { gameConfig } from '../../app.config';
import { Counts, GameState, PlayerID } from '../../types';

const counts = {
  defaultState: {
    '0': {
      deck: gameConfig.numerics.cardsPerDeck,
      hand: 0,
      discarded: 0,
      destroyed: 0,
      played: 0,
    },
    '1': {
      deck: gameConfig.numerics.cardsPerDeck,
      hand: 0,
      discarded: 0,
      destroyed: 0,
      played: 0,
    },
  } as Record<PlayerID, Counts>,

  decrementDeck: (G: GameState, player: PlayerID) => {
    G.counts[player].deck = subtract(G.counts[player].deck, 1);
  },
  incrementDeck: (G: GameState, player: PlayerID) => {
    G.counts[player].deck = add(G.counts[player].deck, 1);
  },

  decrementHand: (G: GameState, player: PlayerID) => {
    G.counts[player].hand = subtract(G.counts[player].hand, 1);
  },
  incrementHand: (G: GameState, player: PlayerID) => {
    G.counts[player].hand = add(G.counts[player].hand, 1);
  },

  decrementDiscarded: (G: GameState, player: PlayerID) => {
    G.counts[player].discarded = subtract(G.counts[player].discarded, 1);
  },
  incrementDiscarded: (G: GameState, player: PlayerID) => {
    G.counts[player].discarded = add(G.counts[player].discarded, 1);
  },

  decrementDestroyed: (G: GameState, player: PlayerID) => {
    G.counts[player].destroyed = subtract(G.counts[player].destroyed, 1);
  },
  incrementDestroyed: (G: GameState, player: PlayerID) => {
    G.counts[player].destroyed = add(G.counts[player].destroyed, 1);
  },

  decrementPlayed: (G: GameState, player: PlayerID) => {
    G.counts[player].played = subtract(G.counts[player].played, 1);
  },
  incrementPlayed: (G: GameState, player: PlayerID) => {
    G.counts[player].played = add(G.counts[player].played, 1);
  },
};

export default counts;
