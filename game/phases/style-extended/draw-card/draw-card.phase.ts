import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../../types';

// import {
//   onTurnBeginLoop,
//   onTurnEndLoop,
//   onTurnMoveLoop,
//   resetDoneState,
//   unsetPlayableCardsInHand,
// } from './methods';

import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
// import { moves } from './play-cards.phase.moves';

export default<PhaseConfig> {
  next: 'playCard',
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer);
    drawCardFromPlayersDeck(G, ctx.currentPlayer);
    G.lastMoveMade = 'drawCard';
  },
  endIf(G: GameState, ctx: Ctx) {
    return G.lastMoveMade === 'drawCard';
  },
};
