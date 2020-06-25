const playerName = {
  __DATA_MODEL: {
    '0': '',
    '1': ''
  },

  /**
   * Sets the provided player's name.
   */
  set: (G, player, string) => (G.playerName[player] = string)
};

export default playerName;
