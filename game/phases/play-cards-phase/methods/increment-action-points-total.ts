import { GameState } from '../../../../types';
import { actionPoints } from '../../../state';

/**
 * Increments the `actionPointsTotal` for the provided player.
 */
const incrementActionPointsTotal = (G: GameState) => {
  actionPoints.incrementTotal(G, '0');
  actionPoints.incrementTotal(G, '1');
}

export default incrementActionPointsTotal;
