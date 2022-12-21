import { Ctx } from 'boardgame.io';
import { multiply } from 'mathjs';
import { CardType } from '../../../enums';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushEventStreamAndSetBoolean,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * double a minion's attack power
 */
const core110 = {
  init: (G: G, player: PlayerID, card: Card) => {
    const { opponent } = getContextualPlayerIds(player);
    G.zones.forEach((z) => {
      z.sides[opponent].forEach((c) => {
        const isNotSelf = c.uuid !== card.uuid;
        const isMinion = c.type === CardType.Minion;
        if (isNotSelf && isMinion) c.booleans.canBeBuffed = true;
      });

      z.sides[player].forEach((c) => {
        const isNotSelf = c.uuid !== card.uuid;
        const isMinion = c.type === CardType.Minion;
        if (isNotSelf && isMinion) c.booleans.canBeBuffed = true;
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
          c.booleans.isBuffed = true;
          c.booleans.hasPowerIncreased = true;
          pushEventStream(c, playedCard, 'wasBuffed');
          pushPowerStreamAndSetDisplay(
            c,
            playedCard,
            multiply(c.displayPower, 2),
            multiply(c.displayPower, 2)
          );
        }
      });
    }

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        c.booleans.canBeBuffed = false;
        if (target !== undefined && cardUuidMatch(c, playedCard)) {
          c.booleans.onPlayWasTriggered = true;
          pushEventStream(c, c, 'onPlayWasTriggered');
        }
      });

      z.sides[opponent].forEach((c) => {
        c.booleans.canBeBuffed = false;
      });
    });
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
            c.booleans.isBuffed = true;
            c.booleans.hasPowerIncreased = true;
            pushEventStream(c, playedCard, 'wasBuffed');
            pushPowerStreamAndSetDisplay(
              c,
              playedCard,
              multiply(c.displayPower, 2),
              multiply(c.displayPower, 2)
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

export default core110;
