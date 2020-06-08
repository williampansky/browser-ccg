const playerIsDisabled = {
  __DATA_MODEL: {
    '0': false,
    '1': false
  },

  /**
   * Enables a player's playerIsDisabled boolean.
   * @param {{}} G
   * @param {string} player
   */
  enable: (G, player) => {
    const result = (G.playerIsDisabled[player] = true);
    return result;
  },

  /**
   * Disables a player's playerIsDisabled boolean.
   * @param {{}} G
   * @param {string} player
   */
  disable: (G, player) => {
    const result = (G.playerIsDisabled[player] = false);
    return result;
  }
};

export default playerIsDisabled;
