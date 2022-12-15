import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  cardIsNotSelf,
  cardUuidMatch,
  limitNumberWithinRange,
  pushEventStreamAndSetBoolean,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * heal a minion for num1 hp
 */
const core082 = {
  execAi: (
    G: GameState,
    ctx: Ctx,
    aiID: PlayerID,
    zoneIdx: number,
    playedCard: Card,
    playedCardIdx: number
  ) => {
    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    const isNotSelf = (c: Card) => {
      return cardIsNotSelf(c, playedCard);
    };

    const cardIsNotDestroyed = (c: Card) => {
      return c.booleans.isDestroyed === false;
    };

    const cardHasHealthReduced = (c: Card) => {
      return c.booleans.hasHealthReduced === true;
    };

    G.zones.forEach((z, zi) => {
      z.sides[aiID].forEach((c, ci) => {
        if (isNotSelf(c) && cardIsNotDestroyed(c) && cardHasHealthReduced(c)) {
          possibleTargets.push({
            zoneNumber: zi,
            cardData: c,
            cardIndex: ci,
          });
        }
      });
    });

    if (possibleTargets.length !== 0) {
      const choice = ctx?.random?.Shuffle(possibleTargets)[0];

      if (choice) {
        const { zoneNumber, cardData, cardIndex } = choice;

        G.zones[zoneNumber].sides[aiID].forEach((c, ci) => {
          const isTargetedCard = cardUuidMatch(c, cardData) && ci === cardIndex;
          if (isTargetedCard) {
            pushHealthStreamAndSetDisplay(
              c,
              playedCard,
              playedCard.numberPrimary,
              limitNumberWithinRange(
                add(c.displayHealth, playedCard.numberPrimary),
                c.baseHealth,
                playedCard.numberPrimary
              )
            );
            pushEventStreamAndSetBoolean(
              G,
              ctx,
              aiID,
              zoneNumber,
              c,
              choice.cardData,
              'wasHealed'
            );
          }
        });

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
      }
    }
  },
};

export default core082;
