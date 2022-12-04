import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../types';

// import {
//   onTurnBeginLoop,
//   onTurnEndLoop,
//   onTurnMoveLoop,
//   resetDoneState,
//   unsetPlayableCardsInHand,
// } from './methods';

import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../utils';
import { fxEnd } from '../../config.bgio-effects';
import removeDestroyedCards from '../_utils/remove-destroyed-cards';
// import { moves } from './play-cards.phase.moves';

export default<PhaseConfig> {
  next: 'playCard',
  onBegin(G: GameState, ctx: Ctx) {
    const { currentPlayer, phase } = ctx;
    logPhaseToConsole(G.turn, phase, currentPlayer);
    removeDestroyedCards(G, ctx);
    drawCardFromPlayersDeck(G, currentPlayer);
    ctx.events?.endPhase();
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder')
  }
};
