import { add } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID, Zone } from '../../../types';
import { actionPoints } from '../../state';

/**
 * +1 %ENERGY% if your side here is empty
 */
const zone009 = {
  init: (G: GameState, ctx: Ctx, zone: Zone) => {
    if (zone.revealed) {
      zone009.exec(G, ctx, zone, '0');
      zone009.exec(G, ctx, zone, '1');
    }
  },

  exec: (
    G: GameState,
    ctx: Ctx,
    zone: Zone,
    player: PlayerID
  ) => {
    if (zone.sides[player].length === 0) {
      const cur = G.actionPoints[player].current;
      const newCur = add(cur, zone.effectAdjustment);
      
      if (G.actionPoints[player].current !== cur + zone.effectAdjustment) {
        actionPoints.setCurrent(G, player, add(cur, zone.effectAdjustment));
      }
    }
  },
};

export default zone009;
