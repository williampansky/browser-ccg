const playerCanUseClassSkill = {
  __DATA_MODEL: {
    '0': false,
    '1': false
  },

  /**
   * Enables a player's playerCanUseClassSkill boolean.
   * @param {{}} G
   * @param {string} player
   */
  enable: (G, player) => {
    const result = (G.playerCanUseClassSkill[player] = true);
    return result;
  },

  /**
   * Disables a player's playerCanUseClassSkill boolean.
   * @param {{}} G
   * @param {string} player
   */
  disable: (G, player) => {
    const result = (G.playerCanUseClassSkill[player] = false);
    return result;
  }
};

export default playerCanUseClassSkill;
