import { add } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID, Zone } from '../../../types';
import { actionPoints } from '../../state';


/**
 * +6 %ENERGY%s this turn
 */
const zone014 = {
  init: (G: GameState, ctx: Ctx, zone: Zone) => {
    if (zone.revealed) {
      zone014.exec(G, ctx, zone.effectAdjustment, '0');
      zone014.exec(G, ctx, zone.effectAdjustment, '1');
    }
  },

  exec: (
    G: GameState,
    ctx: Ctx,
    adjustment: number,
    player: PlayerID
  ) => {
    const cur = G.actionPoints[player].current;
    actionPoints.setCurrent(G, player, add(cur, adjustment));
  },
};

export default zone014;
