import { Ctx } from 'boardgame.io';
import { lte } from 'lodash';
import { subtract } from 'mathjs';
import { CardType } from '../../../enums';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushEventStreamAndSetBoolean,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * deal num1 dmg to a minion and num2 to others in zone
 */
const core050 = {
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
        } else {
          c.booleans.hasHealthReduced = true;
          pushEventStream(c, playedCard, 'wasAttacked');
          pushHealthStreamAndSetDisplay(
            c,
            playedCard,
            -playedCard.numberSecondary,
            subtract(c.displayHealth, playedCard.numberSecondary)
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

  execAi: (G: G, ctx: Ctx, aiID: PlayerID, playedCard: Card) => {
    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    G.zones.forEach((z, zI) => {
      z.sides[aiID].forEach((c, cI) => {
        const isNotSelf = c.uuid !== playedCard.uuid;
        const isMinion = c.type === CardType.Minion;
        const isNotDestroyed = c.booleans.isDestroyed === false;
        if (isNotSelf && isMinion && isNotDestroyed)
          possibleTargets.push({
            zoneNumber: zI,
            cardData: c,
            cardIndex: cI,
          });
      });
    });

    if (possibleTargets.length !== 0) {
      const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;
      G.zones.forEach((z, zI) => {
        z.sides[aiID].forEach((c) => {
          const isTargetedCard = cardUuidMatch(c, choice.cardData);
          if (isTargetedCard) {
            c.booleans.hasHealthReduced = true;
            pushEventStream(c, playedCard, 'wasAttacked');
            pushHealthStreamAndSetDisplay(
              c,
              playedCard,
              -playedCard.numberPrimary,
              subtract(c.displayHealth, playedCard.numberPrimary)
            );
          } else if (c.uuid !== playedCard.uuid) {
            c.booleans.hasHealthReduced = true;
            pushEventStream(c, playedCard, 'wasAttacked');
            pushHealthStreamAndSetDisplay(
              c,
              playedCard,
              -playedCard.numberSecondary,
              subtract(c.displayHealth, playedCard.numberSecondary)
            );
          }

          const isCardPlayed = cardUuidMatch(c, playedCard);
          if (isCardPlayed) {
            pushEventStreamAndSetBoolean(
              G,
              ctx,
              aiID,
              zI,
              c,
              choice.cardData,
              'onPlayWasTriggered'
            );
          }
        });
      });
    }
  },
};

export default core050;
