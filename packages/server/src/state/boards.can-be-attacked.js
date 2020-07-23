/**
 * Disables `canBeAttacked*` of the player's board index object.
 * @param {object} G
 * @param {string} player
 * @param {number} index
 */
export const _dMCBA = (G, player, index) => {
  if (!G.boards[player][index]) return;
  G.boards[player][index].canBeAttackedByMinion = false;
  G.boards[player][index].canBeAttackedByOnPlay = false;
  G.boards[player][index].canBeAttackedByPlayer = false;
  G.boards[player][index].canBeAttackedBySpell = false;
};

/**
 * Enables `canBeAttacked*` of the player's board index object.
 * @param {object} G
 * @param {string} player
 * @param {number} index
 */
export const _eMCBA = (G, player, index) => {
  if (!G.boards[player][index]) return;
  if (G.boards[player][index].isHidden === true) return;
  G.boards[player][index].canBeAttackedByMinion = true;
};

/**
 * Enables `canBeAttacked*` of the player's board index object.
 * @param {object} G
 * @param {string} player
 * @param {number} index
 */
export const _eMCBAbW = (G, player, index) => {
  if (!G.boards[player][index]) return;
  if (G.boards[player][index].isHidden === true) return;
  G.boards[player][index].canBeAttackedByOnPlay = true;
};

/**
 * Disables `canBeAttacked*` on all of the player's minions.
 * @param {object} G
 * @param {string} player
 */
export const _dAMCBA = (G, player) => {
  G.boards[player].forEach((_, i) => _dMCBA(G, player, i));
};

/**
 * Enables `canBeAttacked*` on all of the player's minions.
 * @param {object} G
 * @param {string} player
 * @deprecated
 */
export const _eAMCBA = (G, player) => {
  G.boards[player].forEach((_, i) => _eMCBA(G, player, i));
};
