import { GameState, PlayerID } from '../../types';
import determineFirstRevealer from '../../utils/determine-first-revealer';

const firstRevealer = {
  defaultState: determineFirstRevealer(),

  set: (G: GameState, playerId: PlayerID) => {
    G.firstRevealer = playerId;
  },

  reset: (G: GameState) => {
    G.firstRevealer = firstRevealer.defaultState;
  },
};

export default firstRevealer;
