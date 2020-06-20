const selectedCardInteractionContext = {
  __DATA_MODEL: {
    '0': null,
    '1': null
  },
  set: (G, player, string) => {
    G.selectedCardInteractionContext[player] = string;
  },
  reset: (G, player) => {
    G.selectedCardInteractionContext[player] = null;
  }
};

export default selectedCardInteractionContext;
