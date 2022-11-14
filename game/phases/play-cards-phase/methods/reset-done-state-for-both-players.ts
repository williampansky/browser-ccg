import { GameState } from '../../../../types';
import { playerTurnDone } from '../../../state';

/**
 * Sets `G.done` of each player back to false.
 */
const resetDoneStateForBothPlayers = (G: GameState): void => {
  playerTurnDone.reset(G);
};

export default resetDoneStateForBothPlayers;
