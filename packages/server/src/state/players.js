const players = {
  __DATA_MODEL: {
    '0': {
      deck: [],
      hand: []
    },
    '1': {
      deck: [],
      hand: []
    }
  },

  setDeck: (G, player, array) => {
    G.players[player].deck = array;
  },

  setHand: (G, player, array) => {
    G.players[player].hand = array;
  }
};

export default players;
