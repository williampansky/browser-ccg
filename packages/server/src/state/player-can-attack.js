const playerCanAttack = {
  __DATA_MODEL: {
    '0': false,
    '1': false
  },

  /**
   * Enables a player's playerCanAttack boolean.
   * @param {{}} G
   * @param {string} player
   */
  enable: (G, player) => {
    if (G.playerHasAttacked[player] === true) return;
    const result = (G.playerCanAttack[player] = true);
    return result;
  },

  /**
   * Disables a player's playerCanAttack boolean.
   * @param {{}} G
   * @param {string} player
   */
  disable: (G, player) => {
    const result = (G.playerCanAttack[player] = false);
    return result;
  }
};

export default playerCanAttack;
