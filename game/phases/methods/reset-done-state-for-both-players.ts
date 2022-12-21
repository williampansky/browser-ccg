import { GameState, PlayerID } from '../../../types';
import { playerTurnDone } from '../../state';

/**
 * Sets `G.done` of each player back to false.
 */
const resetDoneState = (G: GameState, player?: PlayerID): void => {
  if (player) playerTurnDone.resetPlayer(G, player);
  else playerTurnDone.reset(G);
};

export default resetDoneState;
