const counts = {
  __DATA_MODEL: {
    '0': {
      deck: 30,
      hand: 0,
      timer: 75000
    },
    '1': {
      deck: 30,
      hand: 0,
      timer: 75000
    }
  },
  deincrementDeck: (G, player) => {
    G.counts[player].deck--;
  },

  deincrementHand: (G, player) => {
    G.counts[player].hand--;
  },

  incrementDeck: (G, player) => {
    G.counts[player].deck++;
  },

  incrementHand: (G, player) => {
    if (G.players[player].deck.length === 0) return;
    G.counts[player].hand++;
  }
};

export default counts;
