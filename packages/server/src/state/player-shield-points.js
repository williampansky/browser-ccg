import { add, subtract } from 'mathjs';
import limitNumberWithinRange from '../utils/range-limit';

const playerShieldPoints = {
  __DATA_MODEL: {
    '0': 0,
    '1': 0
  },

  /**
   * Adds amount to player's playerShieldPoints value.
   * @param {{}} G
   * @param {string} player
   * @param {number} amount
   */
  add: (G, player, amount) => {
    const oldValue = G.playerShieldPoints[player];
    const newValue = add(Number(oldValue), amount);
    G.playerShieldPoints[player] = newValue;
  },

  /**
   * Removes amount from player's playerShieldPoints value.
   * @param {{}} G
   * @param {string} player
   * @param {number} amount
   */
  remove: (G, player, amount) => {
    const oldValue = G.playerShieldPoints[player];
    const calculation = subtract(Number(oldValue), amount);
    const newValue = limitNumberWithinRange(calculation, Infinity, 0);
    G.playerShieldPoints[player] = newValue;
  }
};

export default playerShieldPoints;
