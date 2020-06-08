const playerIsAttacking = {
  __DATA_MODEL: {
    '0': false,
    '1': false
  },

  /**
   * Enables a player's playerIsAttacking boolean.
   * @param {{}} G
   * @param {string} player
   */
  enable: (G, player) => {
    const result = (G.playerIsAttacking[player] = true);
    return result;
  },

  /**
   * Disables a player's playerIsAttacking boolean.
   * @param {{}} G
   * @param {string} player
   */
  disable: (G, player) => {
    const result = (G.playerIsAttacking[player] = false);
    return result;
  }
};

export default playerIsAttacking;
