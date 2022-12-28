import { add } from 'mathjs';
import { CardType } from '../../../enums';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  cardIsNotSelf,
  cardUuidMatch,
  drawCardFromPlayersDeck,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * give minion +num1 hp and draw a card
 */
const core129 = {
  init: (G: G, player: PlayerID, card: Card) => {
    const check = (c: Card) => {
      const isNotSelf = cardIsNotSelf(c, card);
      const isMinion = c.type === CardType.Minion;
      if (isNotSelf && isMinion) c.booleans.canBeBuffed = true;
    };

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => check(c));
    });
  },

  exec: (G: G, targetPlayer: PlayerID, targetCard: Card, playedCard: Card) => {
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
        if (c.uuid === card.uuid && ci === cardIdx) {
          c.booleans.isBuffed = true;
          c.booleans.hasHealthIncreased = true;
          pushEventStream(c, c, 'wasBuffed');
          pushHealthStreamAndSetDisplay(
            card,
            playedCard,
            playedCard.numberPrimary,
            add(c.displayHealth, playedCard.numberPrimary)
          );
        }
      });

      G.zones.forEach((z) => {
        z.sides[targetPlayer].forEach((c) => {
          c.booleans.canBeBuffed = false;
          if (cardUuidMatch(c, playedCard)) {
            c.booleans.onPlayWasTriggered = true;
            pushEventStream(c, c, 'onPlayWasTriggered');
          }
        });
      });

      drawCardFromPlayersDeck(G, targetPlayer, playedCard.numberSecondary);
    }
  },
};

export default core129;
