import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState, Zone } from '../../../types';
import { logPhaseToConsole } from '../../../utils';

const revealZonePhase: PhaseConfig = {
  onBegin(G: GameState, ctx: Ctx) {
    if (G.turn === 0 && !G.zones[0].revealed) {
      logPhaseToConsole(G.turn, ctx.phase, { key: 'ZONE#', value: '0' });
      G.zones[0].revealed = true;
      // initOnZoneRevealInteractions();
      ctx.events?.endPhase();
      // @ts-ignore
      ctx.effects?.fxEnd();
    } else if (G.turn === 1 && !G.zones[1].revealed) {
      logPhaseToConsole(G.turn, ctx.phase, { key: 'ZONE#', value: '1' });
      G.zones[1].revealed = true;
      // initOnZoneRevealInteractions();
      ctx.events?.endPhase();
      // @ts-ignore
      ctx.effects?.fxEnd();
    } else if (G.turn === 2 && !G.zones[2].revealed) {
      logPhaseToConsole(G.turn, ctx.phase, { key: 'ZONE#', value: '2' });
      G.zones[2].revealed = true;
      // initOnZoneRevealInteractions();
      ctx.events?.endPhase();
      // @ts-ignore
      ctx.effects?.fxEnd();
    } else {
      ctx.events?.endPhase();
      // @ts-ignore
      ctx.effects?.fxEnd();
    }
  },
  onEnd(G: GameState, ctx: Ctx) {
    // @ts-ignore
    ctx.effects?.fxEnd();
  },
};

export default revealZonePhase;
