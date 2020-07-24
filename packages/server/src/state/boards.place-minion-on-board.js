import handleBoons from '../boons/handle-boons';

/**
 * Places a slot object in the specific `index` of a player's board.
 *
 * @param {object} G
 * @param {string} player
 * @param {object} boardSlotObject
 * @param {number} index defaults to zero
 */
export const _pC = (G, ctx, player, boardSlotObject, index = 0) => {
  const { turnOrder } = G;
  const otherPlayer = turnOrder.find(p => p !== player);

  const newBoard = [
    ...G.boards[player].slice(0, index),
    boardSlotObject,
    ...G.boards[player].slice(index)
  ];

  // swap new board in
  G.boards[player] = newBoard;
  // G.boards[player].forEach(slot => {
  //   slot.isAttacking = false;
  // });

  handleBoons(G, ctx, player);
  handleBoons(G, ctx, otherPlayer);
};
