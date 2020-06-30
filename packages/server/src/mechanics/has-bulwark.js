const hasBulwark = {
  /**
   * Enables hasBulwark of the player's board index object.
   * Also disables isHidden mechanic, since they can't coincide.
   * @param {oject} G
   * @param {string} player
   * @param {number} index
   */
  enable: (G, player, index) => {
    if (!G.boards[player][index]) return;
    G.boards[player][index].hasBulwark = true;
    G.boards[player][index].isHidden = false;
  },

  /**
   * Disables hasBulwark of the player's board index object.
   * @param {oject} G
   * @param {string} player
   * @param {number} index
   */
  disable: (G, player, index) => {
    if (!G.boards[player][index]) return;
    G.boards[player][index].hasBulwark = false;
  }
};

export default hasBulwark;
