/**
 * Disables `canBeHealed` of the player's board index object.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const _dMCBH = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canBeHealed = false;
};

/**
 * Enables `canBeHealed` of the player's board index object.
 * @param {{}} G
 * @param {string} player
 * @param {number} index
 */
export const _eMCBH = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canBeHealed = true;
};

/**
 * Disables `canBeHealed` on all of the player's minions.
 * @param {{}} G
 * @param {string} player
 */
export const _dAMCBH = (G, player) => {
  G.boards[player].forEach((_, i) => _dMCBH(G, player, i));
};

/**
 * Enables `canBeHealed` on all of the player's minions.
 * @param {{}} G
 * @param {string} player
 */
export const _eAMCBH = (G, player) => {
  G.boards[player].forEach((_, i) => _eMCBH(G, player, i));
};
