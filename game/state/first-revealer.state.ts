import { GameState, PlayerID } from '../../types';
import determineFirstRevealer from '../../utils/determine-first-revealer';

interface RevealOrder {
  first: PlayerID;
  second: PlayerID;
}

const firstRevealer = {
  defaultState: determineFirstRevealer(),

  set: (G: GameState, playerId: PlayerID) => {
    G.firstRevealer = playerId;
  },

  reset: (G: GameState) => {
    G.firstRevealer = firstRevealer.defaultState;
  },

  get: (G: GameState): PlayerID => {
    return G.firstRevealer;
  },

  getRevealOrderArray: (G: GameState): PlayerID[] => {
    if (G.firstRevealer === '1') return ['1', '0'];
    return ['0', '1'];
  },

  getRevealOrder: (G: GameState): RevealOrder => {
    return {
      first: G.firstRevealer,
      second: ['0', '1'].filter(str => str !== G.firstRevealer)[0]
    }

    // if (G.firstRevealer === '1') return {
    //   first: '1',
    //   second: '0'
    // };

    // return {
    //   first: '0',
    //   second: '1'
    // };
  },
};

export default firstRevealer;
