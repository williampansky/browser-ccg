const selectedCardIndex = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },
  set: (G, player, index) => {
    return selectPlayableCardIndex(G, player, index);
  },
  reset: (G, player) => {
    return deselectPlayableCardIndex(G, player);
  }
};

/**
 * Sets the value of `selectPlayableCardIndex` if `index` is provided;
 * otherwise sets the value to null.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const deselectPlayableCardIndex = (G, player) => {
  G.selectedCardIndex[player] = null;
};

export const selectPlayableCardIndex = (G, player, index) => {
  G.selectedCardIndex[player] = index;
};

export default selectedCardIndex;
