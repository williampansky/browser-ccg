import { add, subtract } from 'mathjs';
import limitNumberWithinRange from '../utils/range-limit';

const actionPoints = {
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
  incrementTotal: (G, player) => incrementTotalAP(G, player),
  matchTotal: (G, player) => matchCurrentWithTotalAP(G, player),
  setCurrent: (G, player, amount) => setCurrentAP(G, player, amount),
  setTotal: (G, player, amount) => setTotalAP(G, player, amount),
  subtract: (G, player, amount) => subtractFromCurrentAP(G, player, amount)
};

/**
 * Increments the `total` actionPoints of the `ctx.currentPlayer` by one;
 * unless the total is already at ten.
 *
 * @param {object} G Game state object.
 * @param {string} player Player to increment.
 * @requires mathjs::add()
 */
export const incrementTotalAP = (G, player) => {
  const { actionPoints } = G;
  const { total } = actionPoints[player];

  if (total === 10) return; // eject if total is max (10)

  const newTotal = add(Number(total), 1);
  G.actionPoints[player].total = newTotal;
};

/**
 * Sets the `current` value to the `total`; which allows the
 * `ctx.currentPlayer` to spend actionPoints on card play moves.
 *
 * @param {object} G Game state object.
 * @param {string} player Player to match.
 */
export const matchCurrentWithTotalAP = (G, player) => {
  const { actionPoints } = G;
  const { total } = actionPoints[player];
  G.actionPoints[player].current = total;
};

/**
 * Sets the `current` actionPoints value of the
 * `player` param to the specified `amount`.
 *
 * @param {object} G Game state object.
 * @param {string} player Player to set.
 * @param {number} amount Value to set.
 */
export const setCurrentAP = (G, player, amount) => {
  G.actionPoints[player].current = amount;
};

/**
 * Sets the `total` actionPoints value of the
 * `player` param to the specified `amount`.
 *
 * @param {object} G Game state object.
 * @param {string} player Player to set.
 * @param {number} amount Value to set.
 */
export const setTotalAP = (G, player, amount) => {
  G.actionPoints[player].total = amount;
};

/**
 * Subtracts amount from player's current actionPoints value.
 *
 * @param {object} G Game state object.
 * @param {string} player
 * @param {number} amount
 * @requires mathjs::subtract()
 */
export const subtractFromCurrentAP = (G, player, amount) => {
  const { current, total } = G.actionPoints[player];

  const calculation = subtract(Number(current), Number(amount));
  const newValue = limitNumberWithinRange(calculation, total, 0);

  G.actionPoints[player].current = newValue;
};

export default actionPoints;
