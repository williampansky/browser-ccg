const playerCanBeHealed = {
  __DATA_MODEL: {
    '0': false,
    '1': false
  },

  /**
   * Enables a player's playerCanBeHealed boolean.
   * @param {{}} G
   * @param {string} player
   */
  enable: (G, player) => {
    const result = (G.playerCanBeHealed[player] = true);
    return result;
  },

  /**
   * Disables a player's playerCanBeHealed boolean.
   * @param {{}} G
   * @param {string} player
   */
  disable: (G, player) => {
    const result = (G.playerCanBeHealed[player] = false);
    return result;
  }
};

export default playerCanBeHealed;
