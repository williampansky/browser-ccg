/* eslint-disable no-case-declarations */
import { add } from 'mathjs';
import actionPoints from '../state/action-points';
import drawCard from '../moves/draw-card';
import getCardByID from '../utils/get-card-by-id';
import createBoardSlotObject from '../creators/create-board-slot-object';
import playerHealth from '../state/player-health';
import boards from '../state/boards';

const initSet002OnPlay = (G, ctx, slotObject, cardId, index) => {
  const { turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const {
    minionData: { entourage, numberPrimary, numberSecondary }
  } = slotObject;

  switch (cardId) {
    case 'CORE_041':
      // enhance all minions except itself
      G.boards[currentPlayer].forEach((_, i) => {
        if (index !== i) {
          transformTarget(G, currentPlayer, i, numberPrimary, numberSecondary);
        }
      });
      break;

    // eject
    default:
      return;
  }
};

// transformation method
function transformTarget(G, player, index, n1 = 0, n2 = 0) {
  console.log(G.boards[player][index].currentAttack);
  const AP = parseInt(G.boards[player][index].currentAttack);
  const HP = parseInt(G.boards[player][index].currentHealth);

  const newAP = Math.abs(AP + n1);
  const newHP = Math.abs(HP + n2);

  G.boards[player][index] = {
    ...G.boards[player][index],
    currentAttack: newAP,
    currentHealth: newHP,
    totalAttack: newAP,
    totalHealth: newHP
  };
}

export default initSet002OnPlay;
