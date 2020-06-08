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
    G.playerCanUseClassSkill[player] = true;
  },

  /**
   * Disables a player's playerCanUseClassSkill boolean.
   * @param {{}} G
   * @param {string} player
   */
  disable: (G, player) => {
    G.playerCanUseClassSkill[player] = false;
  }
};

export default playerCanUseClassSkill;
