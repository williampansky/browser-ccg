import { add, subtract } from 'mathjs';

const playerSpellDamage = {
  __DATA_MODEL: {
    '0': 0,
    '1': 0
  },

  /**
   * Adds %SPELL_DAMAGE% amount from slot's numberPrimary.
   * @param {oject} G
   * @param {string} player
   * @param {number} amount
   */
  add: (G, player, amount = 0) => {
    G.playerSpellDamage[player] = add(G.playerSpellDamage[player], amount);
  },

  /**
   * Subtracts %SPELL_DAMAGE% amount from slot's numberPrimary.
   * @param {oject} G
   * @param {string} player
   * @param {number} amount
   */
  subtract: (G, player, amount = 0) => {
    G.playerSpellDamage[player] = subtract(G.playerSpellDamage[player], amount);
  }
};

export default playerSpellDamage;
