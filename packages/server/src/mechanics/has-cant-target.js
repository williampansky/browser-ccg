const hasCantTarget = {
  /**
   * Enables hasCantTarget of the player's board index object.
   * @param {oject} G
   * @param {string} player
   * @param {number} index
   */
  enable: (G, player, index) => {
    if (!G.boards[player][index]) return;
    G.boards[player][index].hasCantTarget = true;
  },

  /**
   * Disables hasCantTarget of the player's board index object.
   * @param {oject} G
   * @param {string} player
   * @param {number} index
   */
  disable: (G, player, index) => {
    if (!G.boards[player][index]) return;
    G.boards[player][index].hasCantTarget = false;
  }
};

export default hasCantTarget;
