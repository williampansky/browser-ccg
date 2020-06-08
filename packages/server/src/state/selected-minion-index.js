const selectedMinionIndex = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },
  set: (G, player, index) => selectPlayableMinionIndex(G, player, index),
  reset: (G, player) => deselectPlayableMinionIndex(G, player)
};

export const deselectPlayableMinionIndex = (G, player) => {
  G.selectedMinionIndex[player] = null;
};

export const selectPlayableMinionIndex = (G, player, index) => {
  G.selectedMinionIndex[player] = index;
};

export default selectedMinionIndex;
