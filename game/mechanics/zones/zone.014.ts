import type { Ctx } from 'boardgame.io';
import type { GameState, PlayerID, Zone } from '../../../types';
import { createCardObject } from '../../../utils';
import { actionPoints, counts } from '../../state';

import setsCore from '../../data/setsCore.json';
import { add } from 'lodash';

/**
 * +6 %ENERGY%s this turn
 */
const zone014 = {
  init: (G: GameState, ctx: Ctx, zone: Zone) => {
    if (zone.revealed) {
      zone014.exec(G, ctx, '0');
      zone014.exec(G, ctx, '1');
    }
  },

  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID
  ) => {
    const cur = G.actionPoints[player].current;
    actionPoints.setCurrent(G, player, add(cur, 6));
  },
};

export default zone014;
