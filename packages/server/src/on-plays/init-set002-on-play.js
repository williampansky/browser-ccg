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
    // eject
    default:
      return;
  }
};

export default castGlobalSet002Spell;
