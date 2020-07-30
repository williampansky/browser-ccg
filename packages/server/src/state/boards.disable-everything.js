/**
 * Disables all interactive properties of the player's board index object.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const _dE = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index] = {
    ...G.boards[player][index],
    canBeAttackedByMinion: false,
    canBeAttackedByPlayer: false,
    canBeAttackedBySpell: false,
    canBeAttackedByOnPlay: false,
    canBeBuffed: false,
    canBeDebuffed: false,
    canBeDestroyed: false,
    canBeExpired: false,
    canBeHealed: false,
    canBeReturned: false,
    canBeStolen: false,
    canReceiveBubble: false,
    canReceiveBulwark: false,
    canReceiveDoubleAttack: false,
    canReceiveRush: false,
    showTooltip: false
  };
};

/**
 * Disables all interactive props on all of the player's board minions.
 * @param {{}} G
 * @param {string} player
 */
export const _dAE = (G, player) => {
  G.boards[player].forEach((_, i) => _dE(G, player, i));
};
