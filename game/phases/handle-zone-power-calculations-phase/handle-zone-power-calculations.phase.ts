import { Ctx, PhaseConfig } from 'boardgame.io';
import { calculateZoneSidePower } from './methods';
import { GameState } from '../../../types';
import { logPhaseToConsole } from '../../../utils';

export default<PhaseConfig> {
  next: 'drawCard',
  onBegin(G: GameState, ctx: Ctx) {
    logPhaseToConsole(G.turn, ctx.phase);

    const { zones } = G;

    // loop thru each zone
    zones.forEach((_, zoneIdx: number) => {
      // set the zone power
      G.zones[zoneIdx].powers = {
        '0': calculateZoneSidePower(G, zoneIdx, '0'),
        '1': calculateZoneSidePower(G, zoneIdx, '1'),
      };
    });

    // end the phase
    ctx.events?.endPhase();
  },
};
