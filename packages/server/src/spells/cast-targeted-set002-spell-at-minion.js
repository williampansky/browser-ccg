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

const castTargetedSet002SpellAtMinion = (
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
  const yourSecSpellDmg = Math.abs(numberSecondary + yourBaseSpellDmg);

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
    case 'CORE_006':
    case 'CORE_047': // Heal 8 Health
    case 'CORE_077': // Heal 6 Health
      healTarget(G, currentPlayer, targetSlotIndex, numberSecondary);
      break;

    case 'CORE_044': // Deal %NUM1% damage
    case 'CORE_058': // Deal %NUM1% damage
    case 'CORE_069': // Deal %NUM1% damage
    case 'CORE_083': // Deal %NUM1% damage
    case 'CORE_120': // Deal %NUM1% damage
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

    /**
     * Buff a minion with taunt and +2/+2
     */
    case 'CORE_046':
      G.boards[currentPlayer][targetSlotIndex] = {
        ...G.boards[currentPlayer][targetSlotIndex],
        currentAttack: Math.abs(targetSlotObject.currentAttack + 2),
        currentHealth: Math.abs(targetSlotObject.currentHealth + 2),
        hasBulwark: true,
        isHidden: false,
        totalAttack: Math.abs(targetSlotObject.totalAttack + 2),
        totalHealth: Math.abs(targetSlotObject.totalHealth + 2)
      };
      break;

    /**
     * Deal %NUM1% damage to an enemy and %NUM2% damage to all others
     */
    case 'CORE_050':
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

      G.boards[otherPlayer].forEach((slot, i) => {
        if (i !== targetSlotIndex) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, yourSecSpellDmg);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }
      });

      // if spell was cast at minion, subtract secondary dmg from player
      if (targetSlotIndex) {
        playerHealth.subtract(G, otherPlayer, yourSecSpellDmg);
      }
      break;

    /**
     * Buff an extra health point
     */
    case 'CORE_054':
      G.boards[currentPlayer][targetSlotIndex] = {
        ...G.boards[currentPlayer][targetSlotIndex],
        currentHealth: Math.abs(targetSlotObject.currentHealth + 1),
        isBuffed: true,
        totalHealth: Math.abs(targetSlotObject.totalHealth + 1)
      };
      break;

    /**
     * Change a minion's HP to 1
     */
    case 'CORE_056':
      G.boards[otherPlayer][targetSlotIndex] = {
        ...targetSlotObject,
        currentHealth: 1,
        isDebuffed: true,
        totalHealth: 1
      };
      break;

    /**
     * Deal 3 damage to a character and Disable it
     */
    case 'CORE_066':
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
      G.boards[otherPlayer][targetSlotIndex].isDisabled = true;
      break;

    /**
     * Transform a minion into a 1/1 Creature
     */
    case 'CORE_070':
      const CORE070slot = createBoardSlotObject(entourage[0]);
      G.boards[otherPlayer][targetSlotIndex] = CORE070slot;
      break;

    /**
     * Give a minion +3 Attack
     */
    case 'CORE_073':
      const newCurAtk = Math.abs(targetSlotObject.currentAttack + 3);
      const newTotAtk = Math.abs(targetSlotObject.totalAttack + 3);
      G.boards[currentPlayer][targetSlotIndex].currentAttack = newCurAtk;
      G.boards[currentPlayer][targetSlotIndex].totalAttack = newTotAtk;
      break;

    /**
     * Give a minion bubble
     */
    case 'CORE_074':
      G.boards[currentPlayer][targetSlotIndex].hasBubble = true;
      break;

    /**
     * Change a minion's attack to 1
     */
    case 'CORE_075':
      G.boards[otherPlayer][targetSlotIndex] = {
        ...targetSlotObject,
        currentAttack: 1,
        totalAttack: 1
      };
      break;

    /**
     * Restore 6 Health to yourself or a friendly minion
     */
    case 'CORE_077':
      boards.addToMinionHealth(
        G,
        currentPlayer,
        targetSlotIndex,
        yourTotalSpellDmg
      );
      break;

    /**
     * Give a minion +4 Attack and +4 Health
     */
    case 'CORE_078':
      G.boards[currentPlayer][targetSlotIndex] = {
        ...targetSlotObject,
        currentAttack: Math.abs(targetSlotObject.currentAttack + 4),
        currentHealth: Math.abs(targetSlotObject.currentHealth + 4),
        totalAttack: Math.abs(targetSlotObject.totalAttack + 4),
        totalHealth: Math.abs(targetSlotObject.totalHealth + 4)
      };
      break;

    /**
     * Attack something for 3 damage and then draw a card
     */
    case 'CORE_080':
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
      drawCard(G, ctx, currentPlayer, 1);
      break;

    /**
     * Give a minion +2 Health points and then draw a card
     */
    case 'CORE_086':
      G.boards[currentPlayer][targetSlotIndex] = {
        ...G.boards[currentPlayer][targetSlotIndex],
        currentHealth: add(targetSlotObject.currentHealth, 2),
        totalHealth: add(targetSlotObject.totalHealth, 2)
      };
      drawCard(G, ctx, currentPlayer, 1);
      break;

    /**
     * Double a minion's current Health value
     */
    case 'CORE_088':
      G.boards[currentPlayer][targetSlotIndex].currentHealth = Math.abs(
        G.boards[currentPlayer][targetSlotIndex].currentHealth * 2
      );
      break;

    /**
     * Kill an enemy minion that has 3 or less Attack
     */
    case 'CORE_089':
      boards.subtractFromMinionHealth(G, otherPlayer, targetSlotIndex, 9000);
      boards.killMinionIfHealthIsZero(
        G,
        ctx,
        otherPlayer,
        targetSlotObject,
        targetSlotIndex
      );
      break;

    /**
     * Kill an enemy minion that has 5 or more Attack
     */
    case 'CORE_090':
      boards.subtractFromMinionHealth(G, otherPlayer, targetSlotIndex, 9000);
      boards.killMinionIfHealthIsZero(
        G,
        ctx,
        otherPlayer,
        targetSlotObject,
        targetSlotIndex
      );
      break;

    /**
     * Take control of over one of your opponent's minions
     */
    case 'CORE_092':
      if (G.boards[currentPlayer].length === 7) {
        return;
      } else {
        const MINION = G.boards[otherPlayer].splice(targetSlotIndex, 1);
        G.boards[currentPlayer].push(MINION[0]);
      }
      break;

    /**
     * Deal 2 damage to one of your enemy's undamaged minions
     */
    case 'CORE_093':
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

    /**
     * Disable an enemy minion
     */
    case 'CORE_096':
      G.boards[otherPlayer][targetSlotIndex].isDisabled = true;
      break;

    /**
     * Deal 1 targeted damage and then draw a card
     */
    case 'CORE_097':
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
      drawCard(G, ctx, currentPlayer, 1);
      break;

    /**
     * Kill an any enemy minion
     */
    case 'CORE_101':
      boards.subtractFromMinionHealth(G, otherPlayer, targetSlotIndex, 9000);
      boards.killMinionIfHealthIsZero(
        G,
        ctx,
        otherPlayer,
        targetSlotObject,
        targetSlotIndex
      );
      break;

    /**
     * Restore a minion to full Health and give it taunt
     */
    case 'CORE_103':
      G.boards[currentPlayer][targetSlotIndex] = {
        ...G.boards[currentPlayer][targetSlotIndex],
        currentHealth: targetSlotObject.totalHealth,
        hasBulwark: true,
        isHidden: false
      };
      break;

    /**
     * Deal 1 damage to an enemy character and Disable it
     */
    case 'CORE_105':
      G.boards[otherPlayer][targetSlotIndex].isDisabled = true;
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

    /**
     * Give a friendly character +3 Attack this turn
     */
    case 'CORE_106':
      G.boards[currentPlayer][targetSlotIndex] = {
        ...G.boards[currentPlayer][targetSlotIndex],
        currentAttack: targetSlotObject.currentAttack + 3
      };
      break;

    /**
     * Give a minion double attack buff
     */
    case 'CORE_107':
      G.boards[currentPlayer][targetSlotIndex].hasDoubleAttack = true;
      break;

    /**
     * change minion into a 0/1 demon thing with guard shield
     */
    case 'CORE_109':
      G.boards[otherPlayer][targetSlotIndex] = {
        ...createBoardSlotObject(entourage[0]),
        hasBulwark: true,
        isHidden: false
      };
      break;

    /**
     * Gain 5 health by sacrificing one of your Undead minions
     */
    case 'CORE_113':
      boards.killMinion(
        G,
        ctx,
        currentPlayer,
        targetSlotObject,
        targetSlotIndex
      );
      playerHealth.add(G, currentPlayer, 5);
      break;

    /**
     * Choose an enemy minion; kill it at the start of your next turn
     */
    case 'CORE_114':
      G.boards[otherPlayer][targetSlotIndex].canBeExpired = false;
      G.boards[otherPlayer][targetSlotIndex].willExpire = true;
      break;

    /**
     * Deal 1 damage to a minion.
     * If that kills it, draw a card.
     */
    case 'CORE_115':
      boards.subtractFromMinionHealth(
        G,
        otherPlayer,
        targetSlotIndex,
        yourTotalSpellDmg
      );

      if (targetSlotObject.currentHealth === 0) {
        drawCard(G, ctx, currentPlayer, 1);
      }

      boards.killMinionIfHealthIsZero(
        G,
        ctx,
        otherPlayer,
        targetSlotObject,
        targetSlotIndex
      );
      break;

    /**
     * Deal 4 damage. Discard a random card
     */
    case 'CORE_116':
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

      discardCardFromHandByIndex(
        G,
        currentPlayer,
        random.Die(G.players[currentPlayer].hand.length)
      );
      break;

    /**
     * Deal 2 damage and heal yourself for that amount
     */
    case 'CORE_119':
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

      playerHealth.add(G, currentPlayer, yourTotalSpellDmg);
      break;

    /**
     * Give a friendly minion stampede
     */
    case 'CORE_123':
      G.boards[currentPlayer][targetSlotIndex].canAttack = true;
      break;

    /**
     * Obliterate an already damaged minion
     */
    case 'CORE_126':
      boards.subtractFromMinionHealth(G, otherPlayer, targetSlotIndex, 9000);
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

export default castTargetedSet002SpellAtMinion;
