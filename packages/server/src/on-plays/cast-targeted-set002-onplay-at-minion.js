/* eslint-disable no-case-declarations */
import { add } from 'mathjs';
import actionPoints from '../state/action-points';
import drawCard from '../moves/draw-card';
import getCardByID from '../utils/get-card-by-id';
import createBoardSlotObject from '../creators/create-board-slot-object';
import playerHealth from '../state/player-health';
import boards from '../state/boards';
import playerCanAttack from '../state/player-can-attack';
import playerAttackValue from '../state/player-attack-value';
import playerShieldPoints from '../state/player-shield-points';
import counts from '../state/counts';
import { discardCardFromHandByIndex } from '../moves/discard-card';

const castTargetedSet002OnPlayAtMinion = (
  G,
  ctx,
  cardId,
  targetSlotObject,
  targetSlotIndex
) => {
  const { boards: gBoards, playedCards, playerSpellDamage, turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { entourage, numberPrimary, numberSecondary } = getCardByID(cardId);

  const theirBoard = gBoards[otherPlayer];
  const theirBoardLength = gBoards[otherPlayer].length;
  const theirPlayedCards = playedCards[otherPlayer];

  const yourBaseSpellDmg = playerSpellDamage[currentPlayer];
  const yourTotalSpellDmg = Math.abs(numberPrimary + yourBaseSpellDmg);

  const getRandomIndex = length => {
    return Math.floor(Math.random() * (length - 0) + 0);
  };

  const getRandomCardId = array => {
    return random.Shuffle(array)[0];
  };

  // heal method
  const healTarget = (G, player, index, n2 = 0) => {
    boards.addToMinionHealth(G, player, index, n2);
  };

  const theirRandomIdx1 = getRandomIndex(theirBoardLength);
  const theirRandomIdx2 = getRandomIndex(theirBoardLength);
  const theirRandomIdx3 = getRandomIndex(theirBoardLength);

  switch (cardId) {
    case 'CORE_001':
      boards.subtractFromMinionHealth(
        G,
        otherPlayer,
        targetSlotIndex,
        yourTotalSpellDmg
      );
      boards.killMinionIfHealthIsZero(
        G,
        ctx,
        otherPlayer,
        targetSlotObject,
        targetSlotIndex
      );
      break;

    // eject
    default:
      break;
  }

  G.boards[currentPlayer].forEach(slot => {
    slot.showTooltip = false;
  });
  G.boards[otherPlayer].forEach(slot => {
    slot.showTooltip = false;
  });
};

export default castTargetedSet002OnPlayAtMinion;
