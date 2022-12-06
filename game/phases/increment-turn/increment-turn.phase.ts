import { add } from 'mathjs';
import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState } from '../../../types';

import { fxEnd } from '../../config.bgio-effects';
import { playerTurnDone } from '../../state';
import { logPhaseToConsole } from '../../../utils';

/**
 * Increments the game turn (note: ***not*** `ctx.turn`).
 */
export default <PhaseConfig>{
  next: 'incrementActionPoints',
  onBegin(G: GameState, ctx: Ctx) {
    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      logPhaseToConsole(G.turn, ctx.phase, undefined, {
        key: 'TURNS',
        value: `${G.turn} => ${add(G.turn, 1)}`,
      });
    }

    G.turn = add(G.turn, 1);

    fxEnd(ctx);
    playerTurnDone.reset(G);
    ctx.events?.endPhase();
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  }
  // endIf(G, ctx) {
  //   return G.playerTurnDone['0'] === false && G.playerTurnDone['1'] === false;
  // },
};
