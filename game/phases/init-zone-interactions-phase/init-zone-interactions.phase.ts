import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState } from '../../../types';
import { logPhaseToConsole } from '../../../utils';

export default<PhaseConfig> {
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);

    ctx.events?.endPhase();
  },
};
