import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../types';

import { fxEnd } from '../../config.bgio-effects';
import {
  drawCardFromPlayersDeck,
  logPhaseToConsole,
  removeDestroyedCards,
} from '../../../utils';

export default <PhaseConfig>{
  next: 'playCard',
  onBegin(G: GameState, ctx: Ctx) {
    const { currentPlayer, phase } = ctx;
    logPhaseToConsole(G.turn, phase, currentPlayer);

    removeDestroyedCards(G, ctx);
    drawCardFromPlayersDeck(G, currentPlayer);

    fxEnd(ctx);
    ctx.events?.endPhase();
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
};
