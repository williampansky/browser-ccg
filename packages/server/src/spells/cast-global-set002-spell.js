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

const castGlobalSet002Spell = (G, ctx, cardId) => {
  const { boards: gBoards, playedCards, playerSpellDamage, turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { entourage, numberPrimary } = getCardByID(cardId);

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

  const theirRandomIdx1 = getRandomIndex(theirBoardLength);
  const theirRandomIdx2 = getRandomIndex(theirBoardLength);
  const theirRandomIdx3 = getRandomIndex(theirBoardLength);

  switch (cardId) {
    // Obtain 1 extra Energy Point for this turn only.
    case 'CORE_043':
      actionPoints.setCurrent(
        G,
        currentPlayer,
        Math.abs(G.actionPoints[currentPlayer].current + 1)
      );
      break;

    // Give your characters +2 Attack this turn.
    case 'CORE_048':
      playerCanAttack.enable(G, currentPlayer);
      playerAttackValue.set(G, currentPlayer, 2);
      G.boards[currentPlayer].forEach(slot => {
        slot.currentAttack = Math.abs(slot.currentAttack + 2);
      });
      break;

    // Gain an empty Energy Point.
    case 'CORE_049':
      actionPoints.incrementTotal(G, currentPlayer);
      break;

    // Draw 2 cards.
    case 'CORE_055':
      drawCard(G, ctx, currentPlayer, 2);
      break;

    // %SUMMON% a %RANDOM% backup minion
    case 'CORE_057':
      if (G.boards[currentPlayer].length === 7) return; // max minions
      const randomEntourageID = random.Shuffle(entourage);
      const randomEntourage = createBoardSlotObject(randomEntourageID[0]);

      // CORE_057a needs the %RUSH% mechanic
      if (randomEntourageID[0] === 'CORE_057a') {
        G.boards[currentPlayer].push({
          ...randomEntourage,
          canAttack: true
        });
      }

      // CORE_057b restores 2 health to all friendlies
      if (randomEntourageID[0] === 'CORE_057b') {
        const HEAL_AMOUNT = 2;

        // heal player
        playerHealth.add(G, currentPlayer, HEAL_AMOUNT);

        // heal minions w/loop method
        for (let i = 0; i < G.boards[currentPlayer].length; i++)
          boards.addToMinionHealth(G, currentPlayer, i, HEAL_AMOUNT);

        G.boards[currentPlayer].push(randomEntourage);
      }

      // CORE_057c has the %HIDDEN% mechanic
      if (randomEntourageID[0] === 'CORE_057c') {
        G.boards[currentPlayer].push({
          ...randomEntourage,
          isHidden: true
        });
      }

      // CORE_057d has the %BULWARK% mechanic
      if (randomEntourageID[0] === 'CORE_057d') {
        G.boards[currentPlayer].push({
          ...randomEntourage,
          hasBulark: true
        });
      }
      break;

    // Choose two enemies at random and deal 2 damage to each of them.
    case 'CORE_060':
      G.boards[otherPlayer].forEach((slot, i) => {
        if (i === (theirRandomIdx1 || theirRandomIdx2)) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }
      });
      break;

    // Choose three enemies at random and deal 1 damage to each of them.
    case 'CORE_063':
      G.boards[otherPlayer].forEach((slot, i) => {
        if (i === theirRandomIdx1) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        } else if (i === theirRandomIdx2) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        } else if (i === theirRandomIdx3) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }
      });
      break;

    // Summon two 0/2 minions with %BULWARK%.
    case 'CORE_064':
      if (G.boards[currentPlayer].length === 7) return; // max minions
      if (G.boards[currentPlayer].length <= 5)
        G.boards[currentPlayer].push({
          ...createBoardSlotObject('CORE_064a'),
          hasBulwark: true
        });
      if (G.boards[currentPlayer].length <= 6)
        G.boards[currentPlayer].push({
          ...createBoardSlotObject('CORE_064a'),
          hasBulwark: true
        });
      break;

    // Deal %NUM% damage to all enemy minions
    case 'CORE_065':
      console.error('CORE_065 not active.');
      break;

    // Draw the next 2 cards from your deck.
    case 'CORE_067':
      drawCard(G, ctx, currentPlayer, 2);
      break;

    // Disable every enemy minion.
    case 'CORE_068':
      G.boards[otherPlayer].forEach(slot => (slot.isDisabled = true));
      break;

    // Deal 4 damage to every enemy minion.
    case 'CORE_072':
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Attack all enemies for 2 damage.
    case 'CORE_079':
      playerHealth.subtract(G, otherPlayer, yourTotalSpellDmg);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Obtain a random card your opponent has already played.
    case 'CORE_084':
      if (G.players[currentPlayer].hand.length === 10) return;
      if (theirPlayedCards.length === 0) return;
      counts.incrementHand(G, currentPlayer);
      G.players[currentPlayer].hand.push(
        getCardByID(getRandomCardId(theirPlayedCards))
      );
      break;

    // Restore 5 Health to yourself.
    case 'CORE_087':
      playerHealth.add(G, currentPlayer, yourTotalSpellDmg);
      break;

    // Deal 2 damage to all of your enemies and then restore
    // that amount of Health to yourself and all your minions.
    case 'CORE_091':
      playerHealth.subtract(G, otherPlayer, yourTotalSpellDmg);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });

      playerHealth.add(G, currentPlayer, yourTotalSpellDmg);
      G.boards[currentPlayer].forEach((_, i) => {
        boards.addToMinionHealth(G, currentPlayer, i, yourTotalSpellDmg);
      });
      break;

    // Give your equipped weapon 2 additional attack points.
    case 'CORE_094':
      if (!G.playerWeapon[currentPlayer]) return;
      playerAttackValue.set(G, currentPlayer, 2);
      break;

    // Deal 3 damage to the enemy player.
    case 'CORE_095':
      playerHealth.subtract(G, otherPlayer, yourTotalSpellDmg);
      break;

    // Draw a card and also deal 1 damage to all enemy minions.
    case 'CORE_098':
      drawCard(G, ctx, currentPlayer, yourTotalSpellDmg);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Draw the next 4 cards from your deck.
    case 'CORE_102':
      drawCard(G, ctx, currentPlayer, 4);
      break;

    // Buff your minions with +2 Health.
    case 'CORE_104':
      G.boards[currentPlayer].forEach(slot => {
        slot.currentHealth = slot.currentHealth + 2;
        slot.totalHealth = slot.totalHealth + 2;
      });
      break;

    // For one turn only; give your minions +3 attack.
    case 'CORE_111':
      G.boards[currentPlayer].forEach(slot => {
        slot.currentAttack = Math.abs(slot.currentAttack + 3);
      });
      break;

    // Deal 3 damage to everyone.
    case 'CORE_121':
      playerHealth.subtract(G, currentPlayer, yourTotalSpellDmg);
      G.boards[currentPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, currentPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, currentPlayer, slot, i);
      });

      playerHealth.subtract(G, otherPlayer, yourTotalSpellDmg);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Attack every minion for 1 damage.
    case 'CORE_124':
      G.boards[currentPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, currentPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, currentPlayer, slot, i);
      });

      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    /**
     * Attack two random enemy minions for 2 damage each
     * @bug
     * @see https://github.com/williampansky/react-ccg/issues/16
     */
    case 'CORE_125':
      G.boards[otherPlayer].forEach((slot, i) => {
        if (i === theirRandomIdx1 && i !== theirRandomIdx2) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }

        if (i === theirRandomIdx2 && i !== theirRandomIdx1) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, yourTotalSpellDmg);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }
      });
      break;

    // Give your player +4 Attack for this turn only.
    case 'CORE_127':
      console.error('CORE_127 not active.');
      // playerCanAttack.enable(G, currentPlayer);
      // playWeaponByCardId(G, ctx, currentPlayer, cardId);
      break;

    // Gain 5 points of shield and draw a card.
    case 'CORE_129':
      playerShieldPoints.add(G, currentPlayer, 5);
      drawCard(G, ctx, currentPlayer, 1);
      break;

    // eject
    default:
      return;
  }
};

export default castGlobalSet002Spell;
