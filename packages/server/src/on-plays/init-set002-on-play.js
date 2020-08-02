/* eslint-disable no-case-declarations */
import { add } from 'mathjs';
import actionPoints from '../state/action-points';
import drawCard from '../moves/draw-card';
import getCardByID from '../utils/get-card-by-id';
import createBoardSlotObject from '../creators/create-board-slot-object';
import playerHealth from '../state/player-health';
import boards from '../state/boards';
import createOnPlayObject from '../creators/create-onplay-object';

const initSet002OnPlay = (G, ctx, slotObject, cardId, index) => {
  const { turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const {
    minionData: { entourage, numberPrimary, numberSecondary }
  } = slotObject;

  /**
   * Bool to determine if an ON_PLAY slot needs to be generated or not
   */
  let createSpellObj = false;

  switch (cardId) {
    case 'CORE_001': // Deal 1 dmg
    case 'CORE_016': // Deal 1 damage
      if (G.boards[otherPlayer].length === 1) return;
      G.boards[otherPlayer].forEach((slot, i) => {
        if (!slot.isHidden) slot.canBeAttackedByOnPlay = true;
        if (!slot.isHidden) slot.showTooltip = true;
        createSpellObj = true;
      });
      break;

    case 'CORE_006':
      if (G.boards[currentPlayer].length === 1) return;
      G.boards[currentPlayer].forEach((slot, i) => {
        if (index !== i) {
          slot.canBeHealed = true;
          createSpellObj = true;
        }
      });
      break;

    case 'CORE_019':
    case 'CORE_041':
      // enhance all minions except itself
      G.boards[currentPlayer].forEach((_, i) => {
        if (index !== i) {
          // ............................ attack ....... health
          buffTarget(G, currentPlayer, i, numberPrimary, numberSecondary);
        }
      });
      break;

    case 'CORE_021': // buff with +1/+1
    case 'CORE_054': // buff with +1 hp
      if (G.boards[currentPlayer].length === 1) return;
      G.boards[currentPlayer].forEach((slot, i) => {
        if (index !== i) {
          slot.canBeBuffed = true;
          createSpellObj = true;
        }
      });
      break;

    // eject
    default:
      break;
  }

  if (createSpellObj === true)
    G.spellObject[currentPlayer] = createOnPlayObject(cardId);
};

// transformation method
function buffTarget(G, player, index, n1 = 0, n2 = 0) {
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
