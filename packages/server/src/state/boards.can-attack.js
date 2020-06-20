/**
 * Disables `canAttack` of the player's board index object.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const _dMCA = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canAttack = false;
};

/**
 * Enables `canAttack` of the player's board index object.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const _eMCA = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canAttack = true;
};

/**
 * Disables `canAttack` on all of the player's minions.
 * @param {{}} G
 * @param {string} player
 */
export const _dAMCA = (G, player) => {
  G.boards[player].forEach((_, i) => _dMCA(G, player, i));
};

/**
 * Enables `canAttack` on all of the player's minions.
 * @param {{}} G
 * @param {string} player
 */
export const _eAMCA = (G, player) => {
  G.boards[player].forEach((_, i) => _eMCA(G, player, i));
};
