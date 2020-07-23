import { RACE } from '@ccg/enums';
import actionPoints from '../state/action-points';
import boards from '../state/boards';
import counts from '../state/counts';
import createBoardSlotObject from '../creators/create-board-slot-object';
import createSpellObject from '../creators/create-spell-object';
import drawCard from '../moves/draw-card';
import getCardByID from '../utils/get-card-by-id';
import playerAttackValue from '../state/player-attack-value';
import playerCanAttack from '../state/player-can-attack';
import playerHealth from '../state/player-health';
import playerShieldPoints from '../state/player-shield-points';
// import playWeaponByCardId from '../weapons/play-weapon-card-by-id';

const initCoreSpell = (G, ctx, cardId, index) => {
  const { turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const spellObj = getCardByID(cardId);
  const damageNumber = spellObj && spellObj.warcryNumber;

  // const YOUR_BOARD = G.boards[currentPlayer];
  const THEIR_BOARD = G.boards[otherPlayer];
  // const THEIR_HAND = G.players[otherPlayer].hand;
  const THEIR_PLAYED_CARDS = G.playedCards[otherPlayer];

  const YOUR_BASE_SPELL_DAMAGE = G.playerSpellDamage[currentPlayer];
  const YOUR_SPELL_BUFF = G.buffs[currentPlayer].spellDamage;
  const YOUR_SPELL_DMG = Math.abs(YOUR_BASE_SPELL_DAMAGE + YOUR_SPELL_BUFF);

  function getRandomIndex(length) {
    return Math.floor(Math.random() * (length - 0) + 0);
  }

  function getRandomCardId(array) {
    return random.Shuffle(array)[0];
  }

  const theirRandomIdx1 = getRandomIndex(THEIR_BOARD.length);
  const theirRandomIdx2 = getRandomIndex(THEIR_BOARD.length);
  const theirRandomIdx3 = getRandomIndex(THEIR_BOARD.length);

  switch (cardId) {
    // Obtain 1 extra actionPoints Point for this turn only.
    case 'CORE_043':
      G.actionPoints[currentPlayer].current = Math.abs(
        G.actionPoints[currentPlayer].current + 1
      );
      break;

    // Give yourself +2 Attack this turn and 2 Armor points.
    case 'CORE_045':
      playerCanAttack.enable(G, currentPlayer);
      playerAttackValue.set(G, currentPlayer, 2);
      playerShieldPoints.add(G, currentPlayer, 2);
      break;

    // Give your characters +2 Attack this turn.
    case 'CORE_048':
      G.boards[currentPlayer].forEach(slot => {
        slot.currentAttack = Math.abs(slot.currentAttack + 2);
      });
      break;

    // Gain an empty actionPoints Point.
    case 'CORE_049':
      actionPoints.incrementTotal(G, currentPlayer);
      break;

    // Draw 2 cards.
    case 'CORE_055':
      drawCard(G, ctx, currentPlayer, 2);
      break;

    // Summon a random Creature companion minion.
    case 'CORE_057':
      if (G.boards[currentPlayer].length === 7) return;
      // max minions
      else {
        const entourage = ['CORE_057a', 'CORE_057b', 'CORE_057c'];
        const randomEntourageID = random.Shuffle(entourage);
        const randomEntourage = createBoardSlotObject(randomEntourageID[0]);

        // CORE_057a needs the Stampede mechanic
        if (randomEntourageID[0] === 'CORE_057a') {
          G.boards[currentPlayer].push({
            ...randomEntourage,
            canAttack: true
          });
        }

        // CORE_057b restore 2 health to all friendlies
        if (randomEntourageID[0] === 'CORE_057b') {
          const HEAL_AMOUNT = 2;

          // heal player
          playerHealth.add(G, ctx.currentPlayer, HEAL_AMOUNT);

          // heal minions w/loop method
          for (let i = 0; i < G.boards[ctx.currentPlayer].length; i++)
            boards.addToMinionHealth(G, ctx.currentPlayer, i, HEAL_AMOUNT);

          G.boards[currentPlayer].push(randomEntourage);
        }

        // CORE_057c has the Concealed mechanic
        if (randomEntourageID[0] === 'CORE_057c') {
          G.boards[currentPlayer].push({
            ...randomEntourage,
            isHidden: true
          });
        }
      }
      break;

    // Choose two enemies at random and deal 2 damage to each of them.
    case 'CORE_060':
      G.boards[otherPlayer].forEach((slot, i) => {
        if (i === (theirRandomIdx1 || theirRandomIdx2)) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }
      });
      break;

    // Choose three enemies at random and deal 1 damage to each of them.
    case 'CORE_063':
      G.boards[otherPlayer].forEach((slot, i) => {
        if (i === theirRandomIdx1) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        } else if (i === theirRandomIdx2) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        } else if (i === theirRandomIdx3) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }
      });
      break;

    // Summon two 0/2 minions with <strong>Guard</strong>.
    case 'CORE_064':
      if (G.boards[currentPlayer].length === 7) return; // max minions
      if (G.boards[currentPlayer].length <= 5)
        G.boards[currentPlayer].push({
          ...createBoardSlotObject('CORE_064a'),
          hasGuard: true
        });
      if (G.boards[currentPlayer].length <= 6)
        G.boards[currentPlayer].push({
          ...createBoardSlotObject('CORE_064a'),
          hasGuard: true
        });
      break;

    // Draw the next 2 cards from your deck.
    case 'CORE_065':
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Draw the next 2 cards from your deck.
    case 'CORE_067':
      drawCard(G, ctx, currentPlayer, 2);
      break;

    // Disable every enemy minion.
    case 'CORE_068':
      G.boards[otherPlayer].forEach((slot, i) => {
        slot.isDisabled = true;
      });
      break;

    // Deal 4 damage to every enemy minion.
    case 'CORE_072':
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Attack all enemies for 2 damage.
    case 'CORE_079':
      playerHealth.subtract(G, otherPlayer, YOUR_SPELL_DMG);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Obtain a random card your opponent has already played.
    case 'CORE_084':
      if (G.players[currentPlayer].hand.length === 10) return;
      if (THEIR_PLAYED_CARDS.length === 0) return;
      counts.incrementHand(G, currentPlayer);
      G.players[currentPlayer].hand.push(
        getCardByID(getRandomCardId(THEIR_PLAYED_CARDS))
      );
      break;

    // Restore 5 Health to yourself.
    case 'CORE_087':
      playerHealth.add(G, currentPlayer, YOUR_SPELL_DMG);
      break;

    // Deal 2 damage to all of your enemies and then restore
    // that amount of Health to yourself and all your minions.
    case 'CORE_091':
      G.lastPlayedCardId = cardId;
      playerHealth.subtract(G, otherPlayer, YOUR_SPELL_DMG);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });

      playerHealth.add(G, currentPlayer, YOUR_SPELL_DMG);
      G.boards[currentPlayer].forEach((_, i) => {
        boards.addToMinionHealth(G, currentPlayer, i, YOUR_SPELL_DMG);
      });
      break;

    // Return one of your opponent's minions to their hand.
    case 'CORE_096':
      G.boards[otherPlayer].forEach(slot => {
        slot.canBeDisabled = true;
      });
      break;

    // Give your equipped weapon 2 additional attack points.
    case 'CORE_094':
      if (!G.playerWeapon[currentPlayer]) return;
      playerAttackValue.set(G, currentPlayer, 2);
      break;

    // Deal 3 damage to the enemy player.
    case 'CORE_095':
      playerHealth.subtract(G, otherPlayer, YOUR_SPELL_DMG);
      break;

    // Draw a card and also deal 1 damage to all enemy minions.
    case 'CORE_098':
      drawCard(G, ctx, currentPlayer, YOUR_SPELL_DMG);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Draw the next 4 cards from your deck.
    case 'CORE_102':
      drawCard(G, ctx, currentPlayer, 4);
      break;

    // Give your Idols +2 additional Health.
    case 'CORE_104':
      G.boards[currentPlayer].forEach(slot => {
        if (slot.minionData.race === RACE[6]) {
          slot.currentHealth = slot.currentHealth + 2;
          slot.totalHealth = slot.totalHealth + 2;
        }
      });
      break;

    // For one turn only; give your minions +3 attack.
    case 'CORE_111':
      G.boards[currentPlayer].forEach(slot => {
        slot.currentAttack = slot.currentAttack + 3;
      });
      break;

    // Deal 3 damage to everyone.
    case 'CORE_121':
      playerHealth.subtract(G, currentPlayer, YOUR_SPELL_DMG);
      G.boards[currentPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, currentPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, currentPlayer, slot, i);
      });

      playerHealth.subtract(G, otherPlayer, YOUR_SPELL_DMG);
      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Attack every minion for 1 damage.
    case 'CORE_124':
      G.boards[currentPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, currentPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, currentPlayer, slot, i);
      });

      G.boards[otherPlayer].forEach((slot, i) => {
        boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
        boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
      });
      break;

    // Attack two random enemy minions for 2 damage each.
    case 'CORE_125':
      G.boards[otherPlayer].forEach((slot, i) => {
        if (i === (theirRandomIdx1 || theirRandomIdx2)) {
          boards.subtractFromMinionHealth(G, otherPlayer, i, YOUR_SPELL_DMG);
          boards.killMinionIfHealthIsZero(G, ctx, otherPlayer, slot, i);
        }
      });
      break;

    // Kill an already damaged minion.
    case 'CORE_126':
      G.spellObject[currentPlayer] = createSpellObject(cardId);
      G.boards[otherPlayer].forEach((slot, i) => {
        if (slot.currentHealth !== slot.totalHealth)
          boards.enableCanBeAttacked(G, otherPlayer, i);
      });
      break;

    // Give your player +4 Attack for this turn only.
    case 'CORE_127':
      playerCanAttack.enable(G, currentPlayer);
      // playWeaponByCardId(G, ctx, currentPlayer, cardId);
      console.log('CORE_127');
      break;

    // Gain 5 points of actionPoints Shield and draw a card.
    case 'CORE_129':
      playerShieldPoints.add(G, currentPlayer, YOUR_SPELL_DMG);
      drawCard(G, ctx, currentPlayer, 1);
      break;

    default:
      break;
  }
};

export default initCoreSpell;
