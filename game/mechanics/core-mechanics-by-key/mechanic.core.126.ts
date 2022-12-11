import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  cardIsNotSelf,
  cardUuidMatch,
  getContextualPlayerIds,
  handleCardDestructionMechanics,
  initActivateEventListeners,
  pushEventStream,
} from '../../../utils';

/**
 * destroy an already damaged minion
 */
const core126 = {
  init: (G: GameState, ctx: Ctx, player: PlayerID, playedCard: Card) => {
    const { opponent } = getContextualPlayerIds(player);

    const isNotSelf = (c: Card) => {
      return cardIsNotSelf(c, playedCard);
    };

    const cardIsNotDestroyed = (c: Card) => {
      return c.booleans.isDestroyed === false;
    };

    const cardHasHealthReduced = (c: Card) => {
      return c.booleans.hasHealthReduced === true;
    };

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        if (isNotSelf(c) && cardIsNotDestroyed(c) && cardHasHealthReduced(c)) {
          c.booleans.canBeDestroyed = true;
        }
      });

      z.sides[opponent].forEach((c) => {
        if (isNotSelf(c) && cardIsNotDestroyed(c) && cardHasHealthReduced(c)) {
          c.booleans.canBeDestroyed = true;
        }
      });
    });
  },

  exec: (
    G: GameState,
    ctx: Ctx,
    targetPlayer: PlayerID,
    targetCard: Card,
    playedCard: Card
  ) => {
    const { opponent, player } = getContextualPlayerIds(targetPlayer);

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
          c.destroyedOnTurn = G.turn;
          c.booleans.isDestroyed = true;
          c.booleans.canBeDestroyed = false;
          pushEventStream(c, playedCard, 'wasDestroyed');
          handleCardDestructionMechanics(G, c, opponent);
        }
      });

      G.zones.forEach((z) => {
        z.sides[player].forEach((c) => {
          c.booleans.canBeAttackedBySpell = false;

          if (cardUuidMatch(c, playedCard)) {
            c.booleans.onPlayWasTriggered = true;
            pushEventStream(c, playedCard, 'onPlayWasTriggered');
          }
        });

        z.sides[opponent].forEach((c) => {
          c.booleans.canBeAttackedBySpell = false;
        });
      });
    }
  },
};

export default core126;
