import type { Ctx } from 'boardgame.io';
import { gt, lt } from 'lodash';
import type { Card, GameState, Zone } from '../../../types';
import { getCardPower } from '../../../utils';

/**
 * Cards here with no mechanics have +3 %POWER%
 */
const zone010 = {
  exec: (G: GameState, ctx: Ctx, zone: Zone, zoneNumber: number) => {
    G.zones[zoneNumber].sides['0'].forEach((c) => {
      const notAdjusted = zone010.cardNotAdjusted(c, zone);
      const noMechanics = zone010.cardHasNoMechanics(c);
      if (notAdjusted && noMechanics) {
          zone010.setAdjustment(c, zone);
          zone010.setPower(c);
          zone010.setBoolens(c);
      }
    });

    G.zones[zoneNumber].sides['1'].forEach((c) => {
      const notAdjusted = zone010.cardNotAdjusted(c, zone);
      const noMechanics = zone010.cardHasNoMechanics(c);
      if (notAdjusted && noMechanics) {
          zone010.setAdjustment(c, zone);
          zone010.setPower(c);
          zone010.setBoolens(c);
      }
    });
  },

  cardNotAdjusted(c: Card, zone: Zone) {
    return c.zonePowerAdjustment === 0;
  },

  cardHasNoMechanics(c: Card) {
    return c.mechanics === undefined || c.mechanics.length === 0
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

export default zone010;
