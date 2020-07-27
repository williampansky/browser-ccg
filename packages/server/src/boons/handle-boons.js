/**
 * @param {object} G
 * @param {object} ctx
 */
const handleBoons = (G, ctx, player) => {
  for (let i = 0; i < G.boards[player].length; i++) {
    if (G.boards[player][i + 1] && G.boards[player][i + 1].hasBoon)
      handleHasBoon(G, ctx, player, i, i + 1);

    if (G.boards[player][i - 1] && G.boards[player][i - 1].hasBoon)
      handleHasBoon(G, ctx, player, i, i - 1);
  }
};

export const handleHasBoon = (G, ctx, player, index, indexIncrement) => {
  // if (!G.boards[player][indexIncrement])
  //   return resetBoon(G, ctx, player, index);

  const boonMinion = G.boards[player][indexIncrement];
  const boonMinionMechanics = boonMinion.minionData.mechanics;
  const boonMinionCanSetVal = boonMinionMechanics.includes('%SET_VALUE%');
  const boonMinionNumber = boonMinion.minionData.numberPrimary;

  // if (!G.boards[player][index]) return;
  const targetMinion = G.boards[player][index];
  const targetMinionCurAtk = targetMinion.currentAttack;
  const targetMinionTotAtk = targetMinion.totalAttack;
  const targetMinionNewAtk = Math.abs(targetMinionCurAtk + boonMinionNumber);
  const targetMinionTotAmount = Math.abs(targetMinionTotAtk + boonMinionNumber);

  if (boonMinionCanSetVal) {
    if (targetMinionCurAtk !== targetMinionTotAmount)
      G.boards[player][index].currentAttack = targetMinionNewAtk;
  }
};

export const resetBoon = (G, ctx, player, index) => {
  G.boards[player][index].currentAttack = G.boards[player][index].totalAttack;
};

export default handleBoons;
