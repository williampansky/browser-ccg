import { GameState, PlayerID } from '../../types';

const playerTurnDone = {
  defaultState: {
    '0': false,
    '1': false,
  } as Record<PlayerID, boolean>,

  set: (G: GameState, player: PlayerID) => {
    G.playerTurnDone[player] = true;
  },

  reset: (G: GameState) => {
    G.playerTurnDone = playerTurnDone.defaultState;
  },

  resetPlayer: (G: GameState, player: PlayerID) => {
    G.playerTurnDone[player] = false;
  },
};

export default playerTurnDone;
