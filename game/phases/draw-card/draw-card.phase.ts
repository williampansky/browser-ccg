import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../types';

import handleZoneMechanics from '../../mechanics/handle-zone-mechanics';
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
    
    const init = (player: PlayerID) => {
      drawCardFromPlayersDeck(G, player);
    }

    init('0');
    init('1');

    handleZoneMechanics(G, ctx);
    fxEnd(ctx);
    ctx.events?.endPhase();
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
};
