import { GameState } from '../../../../types';
import { actionPoints } from '../../../state';

/**
 * Sets `actionPoints` to `actionPointsTotal` for the provided player.
 */
const setActionPointsToTotal = (G: GameState): void => {
  actionPoints.matchTotal(G, '0');
  actionPoints.matchTotal(G, '1');
};

export default setActionPointsToTotal;
