const selectedMinionObject = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },
  set: (G, player, object) => selectMinionObject(G, player, object),
  reset: (G, player) => deselectMinionObject(G, player)
};

export const selectMinionObject = (G, player, object) => {
  G.selectedMinionObject[player] = object;
};

export const deselectMinionObject = (G, player, object) => {
  G.selectedMinionObject[player] = null;
};

export default selectedMinionObject;
