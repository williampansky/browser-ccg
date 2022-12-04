import { Ctx, PhaseConfig } from 'boardgame.io';
import { TurnOrder } from 'boardgame.io/core';
import { add } from 'mathjs';
import { GameState } from '../../../../types';
import { drawCardFromPlayersDeck, logPhaseToConsole } from '../../../../utils';
import { fxEnd } from '../../../config.bgio-effects';
import { actionPoints, playerTurnDone } from '../../../state';
import determineActionPoints from '../_utils/determine-action-points';

/**
 * Increments the game turn (note: ***not*** `ctx.turn`).
 */
export default <PhaseConfig>{
  next: 'drawCard',
  onBegin(G: GameState, ctx: Ctx) {
    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      const apT = G.actionPoints[ctx.currentPlayer].total;
      logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer, {
        key: 'VALUE',
        value: `${apT} => ${add(apT, 1)}`,
      });
    }

    actionPoints.incrementTotal(G, ctx.currentPlayer);
    actionPoints.matchTotal(G, ctx.currentPlayer);
    ctx.events?.endPhase();
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  }
  // endIf(G, ctx) {
  //   return G.playerTurnDone['0'] === false && G.playerTurnDone['1'] === false;
  // },
};
