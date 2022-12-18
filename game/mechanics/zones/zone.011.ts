import { add } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID, Zone } from '../../../types';
import { actionPoints } from '../../state';

/**
 * +2 %ENERGY_SLOT%
 */
const zone011 = {
  init: (G: GameState, ctx: Ctx, zone: Zone) => {
    if (zone.revealed) {
      zone011.exec(G, ctx, zone.effectAdjustment, '0');
      zone011.exec(G, ctx, zone.effectAdjustment, '1');
    }
  },

  exec: (
    G: GameState,
    ctx: Ctx,
    adjustment: number,
    player: PlayerID
  ) => {
    const total = G.actionPoints[player].total;
    actionPoints.setTotal(G, player, add(total, adjustment));
    actionPoints.matchTotal(G, player);
  },
};

export default zone011;
