import { Ctx } from 'boardgame.io';
import { lte } from 'lodash';
import { subtract } from 'mathjs';
import { CardType } from '../../../enums';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  handleDestroyedCards,
  pushEventStream,
  pushEventStreamAndSetBoolean,
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

  execAi: (G: G, ctx: Ctx, aiID: PlayerID, playedCard: Card) => {
    const { opponent } = getContextualPlayerIds(aiID);
    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    G.zones.forEach((z, zI) => {
      z.sides[opponent].forEach((c, cI) => {
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

      G.zones.forEach((z, zI) => {
        z.sides[opponent].forEach((c) => {
          const isTargetedCard = cardUuidMatch(c, choice.cardData);
          if (isTargetedCard) {
            c.booleans.hasHealthReduced = true;
            pushHealthStreamAndSetDisplay(
              c,
              playedCard,
              -playedCard.numberPrimary,
              subtract(c.displayHealth, playedCard.numberPrimary)
            );

            if (lte(subtract(c.displayHealth, playedCard.numberPrimary), 0)) {
              c.booleans.isDestroyed = true;
              c.destroyedOnTurn = G.turn;
            }
          }
        });
      });
    }
  },
};

export default core044;
