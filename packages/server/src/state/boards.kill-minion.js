import recalculateCardMechanics from '../mechanics/recalculate-mechanics';
// import logMessage from 'lib/match-history/log-message';

/**
 * Kill Minion
 * Kill a single active minion.
 * @param {object} G
 * @param {object} ctx
 * @param {string} player
 * @param {object} boardSlot
 * @param {number} index
 */
export const _kM = (G, ctx, player, boardSlot, index) => {
  if (!G.boards[player][index]) return;
  const { minionData } = boardSlot;

  if (G.boards[player][index].isDead) {
    // logMessage(G, ctx, 'killMinion', player, index);
    G.boards[player].splice(index, 1);
    // recalculateCardMechanics(G, ctx, player, minionData, index);
  }
};

/**
 * Kill Minion if Health Reaches Zero
 * Kill a single active minion if its currentHealth reaches zero.
 * @param {object} G
 * @param {object} ctx
 * @param {string} player
 * @param {object} boardSlot
 * @param {number} index
 */
export const _kM0 = (G, ctx, player, boardSlot, index) => {
  if (G.boards[player][index].currentHealth === 0) {
    G.boards[player][index].isDead = true;
    _kM(G, ctx, player, boardSlot, index);
    recalculateCardMechanics(G, ctx, player, boardSlot, index);
  }
};
