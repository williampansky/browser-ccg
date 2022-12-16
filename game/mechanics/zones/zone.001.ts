import type { Ctx } from 'boardgame.io';
import { gt, lt } from 'lodash';
import type { Card, GameState, Zone } from '../../../types';
import { getCardPower } from '../../../utils';

/**
 * Cards here have -3 %POWER%
 */
const zone001 = {
  exec: (G: GameState, ctx: Ctx, zone: Zone, zoneNumber: number) => {
    G.zones[zoneNumber].sides['0'].forEach((c) => {
      const cardNotAdjusted = c.zonePowerAdjustment === 0;
      if (cardNotAdjusted) {
        zone001.setAdjustment(c, zone);
        zone001.setPower(c);
        zone001.setBoolens(c);
      }
    });

    G.zones[zoneNumber].sides['1'].forEach((c) => {
      const cardNotAdjusted = c.zonePowerAdjustment === 0;
      if (cardNotAdjusted) {
        zone001.setAdjustment(c, zone);
        zone001.setPower(c);
        zone001.setBoolens(c);
      }
    });
  },

  setAdjustment(c: Card, zone: Zone) {
    c.zonePowerAdjustment = zone.effectAdjustment;
  },

  setPower(c: Card) {
    c.displayPower = getCardPower(c);
  },

  setBoolens(c: Card) {
    if (gt(c.displayPower, c.basePower)) {
      c.booleans.hasPowerIncreased = true;
      c.booleans.hasPowerReduced = false;
    } else if (lt(c.displayPower, c.basePower)) {
      c.booleans.hasPowerIncreased = false;
      c.booleans.hasPowerReduced = true;
    } else {
      c.booleans.hasPowerIncreased = false;
      c.booleans.hasPowerReduced = false;
    }
  }
};

export default zone001;
