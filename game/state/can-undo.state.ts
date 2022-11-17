import { gameConfig } from '../../app.config';
import { Counts, GameState, PlayerID } from '../../types';

const canUndo = {
  defaultState: {
    '0': false,
    '1': false,
  } as Record<PlayerID, boolean>,

  setPlayer: (G: GameState, player: PlayerID) => G.canUndo[player] = true,
  resetPlayer: (G: GameState, player: PlayerID) => G.canUndo[player] = false,
  reset: (G: GameState) => G.canUndo = canUndo.defaultState,
};

export default canUndo;
