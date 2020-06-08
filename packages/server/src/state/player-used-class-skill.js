const playerUsedClassSkill = {
  __DATA_MODEL: {
    '0': false,
    '1': false
  },

  /**
   * Enables a player's playerUsedClassSkill boolean.
   * @param {{}} G
   * @param {string} player
   */
  enable: (G, player) => {
    const result = (G.playerUsedClassSkill[player] = true);
    return result;
  },

  /**
   * Disables a player's playerUsedClassSkill boolean.
   * @param {{}} G
   * @param {string} player
   */
  disable: (G, player) => {
    const result = (G.playerUsedClassSkill[player] = false);
    return result;
  }
};

export default playerUsedClassSkill;
