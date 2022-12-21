import { GameState } from '../../types';
import { LastCardPlayed } from '../../types/g.interface';

const lastCardPlayed = {
  defaultState: {
    card: undefined,
    index: undefined,
  } as LastCardPlayed,

  get: (G: GameState): LastCardPlayed => {
    const { card, index } = G.lastCardPlayed;
    return { card, index };
  },

  reset: (G: GameState) => {
    G.lastCardPlayed = lastCardPlayed.defaultState;
  },

  set: (G: GameState, { ...payload }: LastCardPlayed) => {
    G.lastCardPlayed = payload;
  },
};

export default lastCardPlayed;
