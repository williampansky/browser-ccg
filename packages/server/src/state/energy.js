import { add, subtract } from 'mathjs';
import limitNumberWithinRange from '../utils/range-limit';

const energy = {
  __DATA_MODEL: {
    '0': {
      current: 0,
      total: 0
    },
    '1': {
      current: 0,
      total: 0
    }
  },
  incrementTotal: (G, player) => incrementTotalEnergy(G, player),
  matchTotal: (G, player) => matchCurrentWithTotalEnergy(G, player),
  setCurrent: (G, player, amount) => setCurrentEnergy(G, player, amount),
  setTotal: (G, player, amount) => setTotalEnergy(G, player, amount),
  subtract: (G, player, amount) => subtractFromCurrentEnergy(G, player, amount)
};

/**
 * Increments the `total` energy of the `ctx.currentPlayer` by one;
 * unless the total is already at ten.
 *
 * @param {{}} G Game state object.
 * @param {string} player Player to increment.
 * @requires mathjs::add()
 */
export const incrementTotalEnergy = (G, player) => {
  const { energy } = G;
  const { total } = energy[player];

  if (total === 10) return;

  const newTotal = add(Number(total), 1);
  G.energy[player].total = newTotal;
};

/**
 * Sets the `current` value to the `total`; which allows the
 * `ctx.currentPlayer` to spend energy on card play moves.
 *
 * @param {{}} G Game state object.
 * @param {string} player Player to match.
 */
export const matchCurrentWithTotalEnergy = (G, player) => {
  const { energy } = G;
  const { total } = energy[player];
  G.energy[player].current = total;
};

/**
 * Sets the `current` energy value of the
 * `player` param to the specified `amount`.
 *
 * @param {{}} G Game state object.
 * @param {string} player Player to set.
 * @param {number} amount Value to set.
 */
export const setCurrentEnergy = (G, player, amount) => {
  G.energy[player].current = amount;
};

/**
 * Sets the `total` energy value of the
 * `player` param to the specified `amount`.
 *
 * @param {{}} G Game state object.
 * @param {string} player Player to set.
 * @param {number} amount Value to set.
 */
export const setTotalEnergy = (G, player, amount) => {
  G.energy[player].total = amount;
};

/**
 * Subtracts amount from player's current energy value.
 *
 * @param {{}} G Game state object.
 * @param {string} player
 * @param {number} amount
 * @requires mathjs::subtract()
 */
export const subtractFromCurrentEnergy = (G, player, amount) => {
  const { current, total } = G.energy[player];

  const calculation = subtract(Number(current), Number(amount));
  const newValue = limitNumberWithinRange(calculation, total, 0);

  G.energy[player].current = newValue;
};

export default energy;
