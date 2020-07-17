const hoveringTarget = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },

  set: (G, player, objectValue, indexValue) => {
    G.hoveringTargetIndex[player] = indexValue;
    G.hoveringTargetObject[player] = objectValue;
  },
  reset: (G, player) => {
    G.hoveringTargetIndex[player] = null;
    G.hoveringTargetObject[player] = null;
  },

  setIndex: (G, player, value) => {
    G.hoveringTargetIndex[player] = value;
  },
  resetIndex: (G, player) => {
    G.hoveringTargetIndex[player] = null;
  },

  setObject: (G, player, value) => {
    G.hoveringTargetObject[player] = value;
  },
  resetObject: (G, player) => {
    G.hoveringTargetObject[player] = null;
  }
};

export default hoveringTarget;
