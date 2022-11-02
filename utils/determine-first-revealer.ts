import { PlayerID, Zone } from '../types';
import getGameResult from './get-game-result';
import getRandomNumberBetween from './get-random-number-between';

/**
 * Determines which player's cards get revealed first on the
 * `revealCards` phase.
 * 
 * If no Zones are provided to the function, a random Player will be chosen.
 * Otherwise revealed-first is determined by number of Zones won.
 * Otherwise revealed-first is determined by total side power combined.
 * Otherwise a random Player will be chosen.
 */
const determineFirstRevealer = (Zones?: Zone[]): PlayerID => {
  if (!Zones) return getRandomNumberBetween(0, 1).toString();
  
  const result = getGameResult(Zones);
  if (result === '') return getRandomNumberBetween(0, 1).toString();
  return result;
};

export default determineFirstRevealer;
