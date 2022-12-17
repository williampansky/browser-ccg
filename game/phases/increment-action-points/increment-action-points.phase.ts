import { add } from 'mathjs';
import { TurnOrder } from 'boardgame.io/core';

import type { Ctx, PhaseConfig } from 'boardgame.io';
import type { GameState, PlayerID } from '../../../types';

import { actionPoints } from '../../state';
import { fxEnd } from '../../config.bgio-effects';
import { logPhaseToConsole } from '../../../utils';

/**
 * Increments the game turn (note: ***not*** `ctx.turn`).
 */
export default <PhaseConfig>{
  next(G: GameState, ctx: Ctx) {
    if (G.turn === 1) return 'revealZone';
    if (G.turn === 2) return 'revealZone';
    else return 'drawCard';
  },
  onBegin(G: GameState, ctx: Ctx) {
    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      const apT = G.actionPoints[ctx.currentPlayer].total;
      logPhaseToConsole(G.turn, ctx.phase, ctx.currentPlayer, {
        key: 'VALUE',
        value: `${apT} => ${add(apT, 1)}`,
      });
    }

    const init = (player: PlayerID) => {
      actionPoints.incrementTotal(G, player);
      actionPoints.matchTotal(G, player);
    }

    init('0');
    init('1');

    fxEnd(ctx);
    ctx.events?.endPhase();
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('turnOrder'),
  },
  // endIf(G, ctx) {
  //   return G.playerTurnDone['0'] === false && G.playerTurnDone['1'] === false;
  // },
};
