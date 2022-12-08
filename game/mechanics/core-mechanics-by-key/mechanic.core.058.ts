import { lte } from 'lodash';
import { subtract } from 'mathjs';
import { CardType } from '../../../enums';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * deal num1 dmg to a minion or num2 if already damaged
 */
const core058 = {
  exec: (G: G, targetPlayer: PlayerID, targetCard: Card, playedCard: Card) => {
    const { player, opponent } = getContextualPlayerIds(targetPlayer);

    // prettier-ignore
    let target: {
      card: Card,
      cardIdx: number,
      zoneNumber: number
    } | undefined;

    G.zones.forEach((z, zi) => {
      z.sides[targetPlayer].forEach((c, ci) => {
        if (cardUuidMatch(c, targetCard)) {
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
        const isTargetedCard = cardUuidMatch(c, card) && ci === cardIdx;
        const hasHealthReduced = c.booleans.hasHealthReduced === true;

        if (isTargetedCard && hasHealthReduced) {
          pushEventStream(c, playedCard, 'wasAttacked');
          pushHealthStreamAndSetDisplay(
            c,
            playedCard,
            -playedCard.numberSecondary,
            subtract(c.displayHealth, playedCard.numberSecondary)
          );
        } else if (isTargetedCard) {
          c.booleans.hasHealthReduced = true;
          pushEventStream(c, playedCard, 'wasAttacked');
          pushHealthStreamAndSetDisplay(
            c,
            playedCard,
            -playedCard.numberPrimary,
            subtract(c.displayHealth, playedCard.numberPrimary)
          );
        }
      });

      G.zones.forEach((z) => {
        z.sides[player].forEach((c) => {
          c.booleans.canBeAttackedBySpell = false;
        });
        z.sides[opponent].forEach((c) => {
          c.booleans.canBeAttackedBySpell = false;
        });
      });
    }
  },
};

export default core058;
