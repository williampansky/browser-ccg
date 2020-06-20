import limitNumberWithinRange from '../utils/range-limit';

/**
 * Add to Minion Health
 * Add health to a minion.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 * @param {number} amount
 */
export const _aTMH = (G, player, index, amount) => {
  const totalHealth = G.boards[player][index].totalHealth;
  const calculation = G.boards[player][index].currentHealth + amount;
  const newHealth = limitNumberWithinRange(calculation, totalHealth);

  G.boards[player][index].currentHealth = newHealth;
};

/**
 * Subtract from Minion Health
 * Subtract health from a minion.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 * @param {number} amount
 */
export const _sFMH = (G, player, index, amount) => {
  const totalHealth = G.boards[player][index].totalHealth;
  const calculation = G.boards[player][index].currentHealth - amount;
  const newHealth = limitNumberWithinRange(calculation, totalHealth);

  G.boards[player][index].currentHealth = newHealth;
};
