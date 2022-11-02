import { GameState } from '../../../../types';
import { firstRevealer } from '../../../state';
import { determineFirstRevealer } from '../../../../utils';

/**
 * Sets the player whose cards will trigger first
 * on the next `revealCards` phase.
 */
const setFirstRevealer = (G: GameState): void => {
  firstRevealer.set(G, determineFirstRevealer(G.zones));
};

export default setFirstRevealer;
