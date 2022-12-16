import { TurnOrder } from 'boardgame.io/core';
import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState, Zone } from '../../../types';
import { logPhaseToConsole } from '../../../utils';
import { fxEnd } from '../../config.bgio-effects';
import initZoneMechanics from '../../mechanics/init-zone-mechanics';

export default<PhaseConfig> {
  next: 'incrementTurn',
  onBegin(G: GameState, ctx: Ctx) {
    const { turn } = G;
    const { currentPlayer, phase } = ctx;
    const player = undefined;

    if (G.turn === 0 && !G.zones[0].revealed) {
      logPhaseToConsole(turn, phase, player, { key: 'ZONE#', value: '0' });
      G.zones[0].revealed = true;
      initZoneMechanics(G, ctx, G.zones[0], 0);
      fxEnd(ctx);
      ctx.events?.endPhase();
    } else if (G.turn === 1 && !G.zones[1].revealed) {
      logPhaseToConsole(turn, phase, player, { key: 'ZONE#', value: '1' });
      G.zones[1].revealed = true;
      initZoneMechanics(G, ctx, G.zones[1], 1);
      fxEnd(ctx);
      ctx.events?.endPhase();
    } else if (G.turn === 2 && !G.zones[2].revealed) {
      logPhaseToConsole(turn, phase, player, { key: 'ZONE#', value: '2' });
      G.zones[2].revealed = true;
      initZoneMechanics(G, ctx, G.zones[2], 2);
      fxEnd(ctx);
      ctx.events?.endPhase();
    } else {
      fxEnd(ctx);
      ctx.events?.endPhase();
    }
  },
  onEnd(G: GameState, ctx: Ctx) {
    fxEnd(ctx);
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  }
};
