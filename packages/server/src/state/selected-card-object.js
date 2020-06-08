const selectedCardObject = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },
  set: (G, player, object) => selectPlayableCardObject(G, player, object),
  reset: (G, player) => deselectPlayableCardObject(G, player)
};

/**
 * Sets the value of `selectPlayableCardObject` if `card` is provided;
 * otherwise sets the value to null.
 * @param {{}} G
 * @param {{}} ctx
 * @param {{}} object
 */
export const selectPlayableCardObject = (G, player, object) => {
  G.selectedCardObject[player] = object;
};

export const deselectPlayableCardObject = (G, player, object) => {
  G.selectedCardObject[player] = null;
};

export default selectedCardObject;
