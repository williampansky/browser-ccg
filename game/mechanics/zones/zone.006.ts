import { gt, lt } from 'lodash';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, Zone } from '../../../types';
import { getCardPower } from '../../../utils';
import { CardType } from '../../../enums';
import { add } from 'mathjs';

/**
 * -1 %POWER% after each turn
 */
const zone006 = {
  exec: (G: GameState, ctx: Ctx, zone: Zone, zoneNumber: number) => {
    G.zones[zoneNumber].sides['0'].forEach((c) => {
      const isMinion = c.type === CardType.Minion;
      if (isMinion) {
        zone006.setAdjustment(c, zone);
        zone006.setPower(zone, c);
        zone006.setBoolens(c);
      }
    });

    G.zones[zoneNumber].sides['1'].forEach((c) => {
      const isMinion = c.type === CardType.Minion;
      if (isMinion) {
        zone006.setAdjustment(c, zone);
        zone006.setPower(zone, c);
        zone006.setBoolens(c);
      }
    });
  },

  setAdjustment(c: Card, zone: Zone) {
    if (c.zonePowerAdjustment === 0) {
      c.zonePowerAdjustment = zone.effectAdjustment;
    }
  },

  setPower(z: Zone, c: Card) {
    c.displayPower--;
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
  },
};

export default zone006;
