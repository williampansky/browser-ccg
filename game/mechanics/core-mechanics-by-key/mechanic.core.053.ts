import type { Ctx } from 'boardgame.io';
import { gt, lt } from 'lodash';
import { subtract } from 'mathjs';
import type { Card, GameState, PlayerID } from '../../../types';
import { cardUuidMatch, pushHealthStreamAndSetDisplay } from '../../../utils';

/**
 * deal num1 dmg to a minion
 */
const core053 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    targetPlayer: PlayerID,
    cardToAttack: Card,
    cardToBlame: Card
  ) => {
    // prettier-ignore
    let target: {
    card: Card,
    cardIdx: number,
    zoneNumber: number
  } | undefined;

    G.zones.forEach((z, zi) => {
      z.sides[targetPlayer].forEach((c, ci) => {
        if (cardUuidMatch(c, cardToAttack)) {
          target = {
            card: c,
            cardIdx: ci,
            zoneNumber: zi,
          };
        }
      });
    });

    if (target !== undefined) {
      const { card, cardIdx, zoneNumber } = target;

      G.zones[zoneNumber].sides[targetPlayer].forEach((c, ci) => {
        if (c.uuid === card.uuid && ci === cardIdx) {
          c.booleans.canBeAttackedBySpell = false;

          // makes sure this doesn't trigger twice
          if (!c.healthStream.find(obj => obj.uuid === cardToBlame.uuid)) {
            pushHealthStreamAndSetDisplay(  
              c,
              cardToBlame,
              -cardToBlame.numberPrimary,
              subtract(c.displayHealth, cardToBlame.numberPrimary)
            );

            if (lt(c.displayHealth, c.baseHealth)) {
              c.booleans.hasHealthIncreased = false;
              c.booleans.hasHealthReduced = true;
            }
          }
        }
      });

      G.zones.forEach((z, zi) => {
        z.sides['0'].forEach((c, ci) => {
          c.booleans.canBeAttackedBySpell = false;
          if (c.uuid === cardToBlame.uuid) c.booleans.onPlayWasTriggered = true;
        });

        z.sides['1'].forEach((c, ci) => {
          c.booleans.canBeAttackedBySpell = false;
        });
      });
    }
  },
};

export default core053;
