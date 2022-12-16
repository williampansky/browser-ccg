import { add, lt } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, Zone } from '../../../types';
import { limitNumberWithinRange } from '../../../utils';
import { gameConfig } from '../../../app.config';

const {
  numerics: { actionPointsTotal },
} = gameConfig;

/**
 * Cards cost 1 less
 */
const zone002 = {
  exec: (G: GameState, ctx: Ctx, zone: Zone) => {
    G.players['0'].cards.hand.forEach((c) => {
      const cardNotAdjusted = c.zoneCostAdjustment === 0;
      if (cardNotAdjusted) {
        zone002.setCostAdjustment(c, zone);
        zone002.setBoolens(c);
      }
    });

    G.players['1'].cards.hand.forEach((c) => {
      const cardNotAdjusted = c.zoneCostAdjustment === 0;
      if (cardNotAdjusted) {
        zone002.setCostAdjustment(c, zone);
        zone002.setBoolens(c);
      }
    });
  },

  setCostAdjustment(c: Card, zone: Zone) {
    c.zoneCostAdjustment = zone.effectAdjustment;
    c.currentCost = limitNumberWithinRange(
      add(c.currentCost, zone.effectAdjustment),
      actionPointsTotal,
      0
    );
  },

  setBoolens(c: Card) {
    if (lt(c.currentCost, c.baseCost)) {
      c.booleans.hasCostReduced = true;
      c.booleans.hasCostIncreased = false;
    } else {
      c.booleans.hasCostReduced = false;
      c.booleans.hasCostIncreased = false;
    }
  },
};

export default zone002;
