const playerHero = {
  __DATA_MODEL: {
    '0': '',
    '1': ''
  },

  set: (G, player, string) => {
    G.playerHero[player] = string;
  }
};

export default playerHero;
