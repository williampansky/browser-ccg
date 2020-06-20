import boards from '../state/boards';
import playerCanBeAttacked from '../state/player-can-be-attacked';
import selectedMinionIndex from '../state/selected-minion-index';
import selectedMinionObject from '../state/selected-minion-object';

/**
 * Sets `selectedMinionIndex` & `selectedMinionObject` of the current player.
 *
 * @param {object} G
 * @param {object} ctx
 * @param {object} slotObject
 * @param {number} index
 */
const deselectMinion = (G, ctx) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  G.boards[currentPlayer].forEach((slot, i) => {
    slot.isAttacking = false;
  });

  selectedMinionIndex.reset(G, currentPlayer);
  selectedMinionObject.reset(G, currentPlayer);
  playerCanBeAttacked.disable(G, otherPlayer);
  boards.disableAllCanBeAttacked(G, otherPlayer);
};

export default deselectMinion;
