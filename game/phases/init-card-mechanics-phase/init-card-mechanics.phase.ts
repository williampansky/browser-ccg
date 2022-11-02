import { PhaseConfig } from 'boardgame.io';
import { logPhaseToConsole } from '../../../utils';

const initCardMechanicsPhase: PhaseConfig = {
  next: 'initZoneInteractions',
  onBegin(G, ctx) {
    logPhaseToConsole(G.turn, ctx.phase);

    // @todo add mechanics here
    ctx.events?.endPhase();
  },
};

export default initCardMechanicsPhase;
