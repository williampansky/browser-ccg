const playerCanBeAttacked = {
  playerCanBeAttackedByMinion: {
    '0': false,
    '1': false
  },
  playercanBeAttackedByOnPlay: {
    '0': false,
    '1': false
  },
  playerCanBeAttackedByPlayer: {
    '0': false,
    '1': false
  },
  playerCanBeAttackedBySpell: {
    '0': false,
    '1': false
  },
  enableByMinion: (G, player) => (G.playerCanBeAttackedByMinion[player] = true),
  enableByOnPlay: (G, player) => (G.playercanBeAttackedByOnPlay[player] = true),
  enableByPlayer: (G, player) => (G.playerCanBeAttackedByPlayer[player] = true),
  enableBySpell: (G, player) => (G.playerCanBeAttackedBySpell[player] = true),
  disable: (G, player) => {
    G.playerCanBeAttackedByMinion[player] = false;
    G.playercanBeAttackedByOnPlay[player] = false;
    G.playerCanBeAttackedByPlayer[player] = false;
    G.playerCanBeAttackedBySpell[player] = false;
  }
};

export default playerCanBeAttacked;
