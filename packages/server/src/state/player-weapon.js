const playerWeapon = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },

  /**
   * Pushes weaponObj to a player's playerWeapon key.
   * @param {{}} G
   * @param {string} player
   * @param {{}} weaponObj
   */
  equip: (G, player, weaponObj) => {
    const result = (G.playerWeapon[player] = weaponObj);
    return result;
  },

  /**
   * Resets a player's playerWeapon object.
   * @param {{}} G
   * @param {string} player
   */
  unequip: (G, player) => {
    const result = (G.playerWeapon[player] = null);
    return result;
  }
};

export default playerWeapon;
