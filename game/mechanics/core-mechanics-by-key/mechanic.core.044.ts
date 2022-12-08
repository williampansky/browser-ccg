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
 * deal 1 dmg to a minion
 */
const core044 = {
  init: (G: G, player: PlayerID, card: Card) => {
    const { opponent } = getContextualPlayerIds(player);
    G.zones.forEach((z) => {
      z.sides[opponent].forEach((c) => {
        const isNotSelf = c.uuid !== card.uuid;
        const isMinion = c.type === CardType.Minion;
        if (isNotSelf && isMinion) c.booleans.canBeAttackedBySpell = true;
      });

      z.sides[player].forEach((c) => {
        const isNotSelf = c.uuid !== card.uuid;
        const isMinion = c.type === CardType.Minion;
        if (isNotSelf && isMinion) c.booleans.canBeAttackedBySpell = true;
      });
    });
  },
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
        if (isTargetedCard) {
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

      G.zones.forEach((z, zi) => {
        z.sides[player].forEach((c) => {
          c.booleans.canBeAttackedBySpell = false;
          if (cardUuidMatch(c, playedCard)) {
            c.booleans.onPlayWasTriggered = true;
            pushEventStream(c, c, 'onPlayWasTriggered');
          }
        });

        z.sides[opponent].forEach((c) => {
          c.booleans.canBeAttackedBySpell = false;
        });
      });
    }
  },
};

export default core044;
