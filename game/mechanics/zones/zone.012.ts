import type { Ctx } from 'boardgame.io';
import type { GameState, Zone } from '../../../types';

/**
 * The game now ends after turn 6
 */
const zone012 = {
  init: (G: GameState, ctx: Ctx, zone: Zone) => {
    if (zone.revealed) {
      G.totalTurns = zone.effectAdjustment;
    }
  },
};

export default zone012;
