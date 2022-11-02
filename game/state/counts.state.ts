import { gameConfig } from '../../config.app';
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

  incrementDeck: (G: GameState, player: PlayerID) => G.counts[player].deck++,
  decrementDeck: (G: GameState, player: PlayerID) => G.counts[player].deck--,

  decrementHand: (G: GameState, player: PlayerID) => G.counts[player].hand--,
  incrementHand: (G: GameState, player: PlayerID) => G.counts[player].hand++,
  
  decrementDiscarded: (G: GameState, player: PlayerID) => G.counts[player].discarded--,
  incrementDiscarded: (G: GameState, player: PlayerID) => G.counts[player].discarded++,
  
  decrementDestroyed: (G: GameState, player: PlayerID) => G.counts[player].destroyed--,
  incrementDestroyed: (G: GameState, player: PlayerID) => G.counts[player].destroyed++,
  
  decrementPlayed: (G: GameState, player: PlayerID) => G.counts[player].played--,
  incrementPlayed: (G: GameState, player: PlayerID) => G.counts[player].played++,
};

export default counts;
