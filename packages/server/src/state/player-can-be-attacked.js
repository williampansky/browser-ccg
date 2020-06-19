const playerCanBeAttacked = {
  playerCanBeAttackedByMinion: {
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
  playercanBeAttackedByOnPlay: {
    '0': false,
    '1': false
  },
  enableByMinion: (G, player) => (G.playerCanBeAttackedByMinion[player] = true),
  enableByPlayer: (G, player) => (G.playerCanBeAttackedByPlayer[player] = true),
  enableBySpell: (G, player) => (G.playerCanBeAttackedBySpell[player] = true),
  enableByWarcry: (G, player) => (G.playercanBeAttackedByOnPlay[player] = true),
  disable: (G, player) => {
    G.playerCanBeAttackedByMinion[player] = false;
    G.playerCanBeAttackedByPlayer[player] = false;
    G.playerCanBeAttackedBySpell[player] = false;
    G.playercanBeAttackedByOnPlay[player] = false;
  }
};

export default playerCanBeAttacked;
