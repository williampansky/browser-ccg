import { Ctx, PhaseConfig } from 'boardgame.io';
import { TurnOrder } from 'boardgame.io/core';
import { add } from 'mathjs';
import { GameState } from '../../../../types';
import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import { playerTurnDone } from '../../../state';
import determineActionPoints from '../utils/determine-action-points';

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
