import { Ctx, PhaseConfig } from 'boardgame.io';
import { GameState } from '../../../types';
import { calculateZoneSidePower, logPhaseToConsole } from '../../../utils';

export default<PhaseConfig> {
  next: 'drawCard',
  onBegin(G: GameState, ctx: Ctx) {
    if (G.gameConfig.debugConfig.logPhaseToConsole) {
      console.log(G.turn, ctx.phase);
    }

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
