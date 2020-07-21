/**
 * Disables `canBeDebuffed` of the player's board index object.
 * @param {object} G
 * @param {string} player
 * @param {number} index
 */
export const _dMCBDb = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canBeDebuffed = false;
};

/**
 * Enables `canBeDebuffed` of the player's board index object.
 * @param {object} G
 * @param {string} player
 * @param {number} index
 */
export const _eMCBDb = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canBeDebuffed = true;
};

/**
 * Disables `canBeDebuffed` on all of the player's minions.
 * @param {object} G
 * @param {string} player
 */
export const _dAMCBDb = (G, player) => {
  G.boards[player].forEach((_, i) => _dMCBDb(G, player, i));
};

/**
 * Enables `canBeDebuffed` on all of the player's minions.
 * @param {object} G
 * @param {string} player
 */
export const _eAMCBDb = (G, player) => {
  G.boards[player].forEach((_, i) => _eMCBDb(G, player, i));
};
