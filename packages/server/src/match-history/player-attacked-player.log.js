const logPlayerAttackedPlayerMessage = (G, currentPlayer, otherPlayer) => {
  return `Player ${currentPlayer} attacked Player ${otherPlayer} for ${G.playerAttackValue[currentPlayer]} damage.`;
};

export default logPlayerAttackedPlayerMessage;
