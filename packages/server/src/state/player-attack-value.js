const playerAttackValue = {
  __DATA_MODEL: {
    '0': 0,
    '1': 0
  },
  set: (G, player, value) => {
    // if (G.playerWeapon[player] !== null)
    //   G.playerAttackValue[player] = Math.abs(
    //     G.playerWeapon[player].attack + G.playerAttackValue[player] + value
    //   );
    // else
    G.playerAttackValue[player] = Math.abs(G.playerAttackValue[player] + value);
  },
  reset: (G, player) => {
    G.playerAttackValue[player] = 0;
  }
};

export default playerAttackValue;
