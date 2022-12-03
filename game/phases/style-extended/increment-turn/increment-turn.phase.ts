import { Ctx, PhaseConfig } from 'boardgame.io';
import { add } from 'mathjs';
import { GameState } from '../../../../types';
import { logPhaseToConsole } from '../../../../utils';

/**
 * Increments the game turn (note: ***not*** `ctx.turn`).
 */
export default <PhaseConfig>{
  next: 'drawCard',
  onBegin(G: GameState, ctx: Ctx) {
    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      logPhaseToConsole(G.turn, ctx.phase, undefined, {
        key: 'TURNS',
        value: `${G.turn} => ${add(G.turn, 1)}`,
      });
    }

    G.turn = add(G.turn, 1);
    ctx.events?.endPhase();

    // @ts-ignore
    ctx.effects?.fxEnd();
  },
};
