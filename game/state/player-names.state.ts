import { GameState, PlayerID, PlayerName } from '../../types';

const playerNames = {
  defaultState: {
    '0': '',
    '1': '',
  },

  set: (G: GameState, playerId: PlayerID, name: PlayerName) => {
    G.playerNames[playerId] = name;
  },

  reset: (G: GameState) => {
    G.playerNames = playerNames.defaultState;
  },
};

export default playerNames;
