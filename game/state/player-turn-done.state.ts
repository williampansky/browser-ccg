import { GameState, PlayerID } from '../../types';

const playerTurnDone = {
  defaultState: {
    '0': false,
    '1': false,
  } as Record<PlayerID, boolean>,

  set: (G: GameState, playerId: PlayerID) => {
    G.playerTurnDone[playerId] = true;
  },

  reset: (G: GameState) => {
    G.playerTurnDone = playerTurnDone.defaultState;
  },
};

export default playerTurnDone;
