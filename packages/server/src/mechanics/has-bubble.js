const hasBubble = {
  /**
   * Enables hasBubble of the player's board index object.
   * @param {oject} G
   * @param {string} player
   * @param {number} index
   */
  enable: (G, player, index) => {
    if (!G.boards[player][index]) return;
    G.boards[player][index].hasBubble = true;
  },

  /**
   * Disables hasBubble of the player's board index object.
   * @param {oject} G
   * @param {string} player
   * @param {number} index
   */
  disable: (G, player, index) => {
    if (!G.boards[player][index]) return;
    G.boards[player][index].hasBubble = false;
  }
};

export default hasBubble;
