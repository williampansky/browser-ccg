import type { Ctx } from 'boardgame.io';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  cardIsNotSelf,
  cardUuidMatch,
  getContextualPlayerIds,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * set minion's hp to num1
 */
const core056 = {
  init: (G: G, ctx: Ctx, card: Card) => {
    const { opponent, player } = getContextualPlayerIds(ctx.currentPlayer);

    const check = (c: Card) => {
      if (cardIsNotSelf(c, card)) c.booleans.canBeDebuffed = true;
    };

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => check(c));
      z.sides[opponent].forEach((c) => check(c));
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
          c.booleans.isDebuffed = true;
          c.booleans.hasHealthReduced = false;
          pushEventStream(c, c, 'wasDebuffed');
          pushHealthStreamAndSetDisplay(
            card,
            playedCard,
            playedCard.numberPrimary,
            playedCard.numberPrimary
          );
        }
      });

      G.zones.forEach((z) => {
        z.sides['0'].forEach((c) => {
          c.booleans.canBeDebuffed = false;
          if (cardUuidMatch(c, playedCard)) {
            c.booleans.onPlayWasTriggered = true;
            pushEventStream(c, c, 'onPlayWasTriggered');
          }
        });

        z.sides['1'].forEach((c, ci) => {
          c.booleans.canBeDebuffed = false;
        });
      });
    }
  },
};

export default core056;
