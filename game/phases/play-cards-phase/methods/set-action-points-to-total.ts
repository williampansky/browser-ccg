import { GameState, PlayerID } from '../../../../types';
import { actionPoints } from '../../../state';

/**
 * Sets `actionPoints` to `actionPointsTotal` for the provided player.
 */
const setActionPointsToTotal = (G: GameState, player?: PlayerID): void => {
  if (player) {
    actionPoints.matchTotal(G, player);
  } else {
    actionPoints.matchTotal(G, '0');
    actionPoints.matchTotal(G, '1');
  }
};

export default setActionPointsToTotal;
