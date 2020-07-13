/* eslint-disable no-case-declarations */
import { add } from 'mathjs';
import actionPoints from '../state/action-points';
import drawCard from '../moves/draw-card';
import getCardByID from '../utils/get-card-by-id';
import createBoardSlotObject from '../creators/create-board-slot-object';
import playerHealth from '../state/player-health';
import boards from '../state/boards';

const castGlobalSet002Spell = (G, ctx, cardId) => {
  const { turnOrder } = G;
  const { currentPlayer, random } = ctx;
  const otherPlayer = turnOrder.find(p => p !== currentPlayer);
  const { entourage } = getCardByID(cardId);

  switch (cardId) {
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
          isConcealed: true
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

    // Draw the next 4 cards from your deck.
    case 'CORE_102':
      drawCard(G, ctx, currentPlayer, 4);
      break;

    // eject
    default:
      return;
  }
};

export default castGlobalSet002Spell;
