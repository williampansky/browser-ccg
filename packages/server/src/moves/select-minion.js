import boards from '../state/boards';
import playerCanBeAttacked from '../state/player-can-be-attacked';
import selectedMinionIndex from '../state/selected-minion-index';
import selectedMinionObject from '../state/selected-minion-object';
import deselectCard from './deselect-card';

/**
 * Sets `selectedMinionIndex` & `selectedMinionObject` of the current player.
 *
 * @param {object} G
 * @param {object} ctx
 * @param {object} slotObject
 * @param {number} index
 */
const selectMinion = (G, ctx, slotObject, index) => {
  const { turnOrder } = G;
  const { currentPlayer } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);

  G.boards[currentPlayer].forEach((slot, i) => {
    if (i === index) slot.isAttacking = true;
    else slot.isAttacking = false;
  });

  deselectCard(G, ctx);
  selectedMinionIndex.set(G, currentPlayer, index);
  selectedMinionObject.set(G, currentPlayer, slotObject);
  playerCanBeAttacked.enableByMinion(G, otherPlayer);
  boards.determineAttackTargets(G, otherPlayer);
};

export default selectMinion;
