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

const castTargetedSet002SpellAtMinion = (
  G,
  ctx,
  cardId,
  targetSlotObject,
  targetSlotIndex
) => {
  const {
    boards: gBoards,
    playedCards,
    playerBuffs,
    playerSpellDamage,
    turnOrder
  } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { entourage, numberPrimary } = getCardByID(cardId);

  const theirBoard = gBoards[otherPlayer];
  const theirBoardLength = gBoards[otherPlayer].length;
  const theirPlayedCards = playedCards[otherPlayer];

  const yourBaseSpellDmg = playerSpellDamage[currentPlayer];
  const yourSpellDamageBuff = playerBuffs[currentPlayer].spellDamage;
  const yourTotalSpellDmg = Math.abs(
    numberPrimary + yourBaseSpellDmg + yourSpellDamageBuff
  );

  const getRandomIndex = length => {
    return Math.floor(Math.random() * (length - 0) + 0);
  };

  const getRandomCardId = array => {
    return random.Shuffle(array)[0];
  };

  const theirRandomIdx1 = getRandomIndex(theirBoardLength);
  const theirRandomIdx2 = getRandomIndex(theirBoardLength);
  const theirRandomIdx3 = getRandomIndex(theirBoardLength);

  switch (cardId) {
    // Deal 1 damage to a minion
    case 'CORE_044':
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

    // Buff a minion with taunt and +2/+2
    case 'CORE_046':
      G.boards[currentPlayer][targetSlotIndex] = {
        ...targetSlotObject,
        currentAttack: Math.abs(targetSlotObject.currentAttack + 2),
        currentHealth: Math.abs(targetSlotObject.currentHealth + 2),
        hasBulwark: true,
        isHidden: false,
        totalAttack: Math.abs(targetSlotObject.totalAttack + 2),
        totalHealth: Math.abs(targetSlotObject.totalHealth + 2)
      };
      break;

    // Change a minion's HP to 1
    case 'CORE_056':
      G.boards[otherPlayer][targetSlotIndex] = {
        ...targetSlotObject,
        currentHealth: 1,
        isDebuffed: true,
        totalHealth: 1
      };
      break;

    // change minion into a 0/1 demon thing with guard shield
    case 'CORE_109':
      G.boards[otherPlayer][targetSlotIndex] = {
        ...createBoardSlotObject(entourage[0]),
        hasBulwark: true
      };
      break;

    // eject
    default:
      break;
  }
};

export default castTargetedSet002SpellAtMinion;
