/**
 * Disables `canBeBuffed` of the player's board index object.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const _dMCBB = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canBeBuffed = false;
};

/**
 * Enables `canBeBuffed` of the player's board index object.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const _eMCBB = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canBeBuffed = true;
};

/**
 * Disables `canBeBuffed` on all of the player's minions.
 * @param {{}} G
 * @param {string} player
 */
export const _dAMCBB = (G, player) => {
  G.boards[player].forEach((_, i) => _dMCBB(G, player, i));
};

/**
 * Enables `canBeBuffed` on all of the player's minions.
 * @param {{}} G
 * @param {string} player
 */
export const _eAMCBB = (G, player) => {
  G.boards[player].forEach((_, i) => _eMCBB(G, player, i));
};
