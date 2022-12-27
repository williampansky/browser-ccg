import type { Ctx } from 'boardgame.io';
import { CardType } from '../../../enums';
import type { Card, GameState as G, PlayerID } from '../../../types';
import {
  aiSpreadEventStreamAndOnPlayBoolean,
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

  execAi: (
    G: G,
    ctx: Ctx,
    aiID: PlayerID,
    zoneNumber: number,
    playedCard: Card,
    playedCardIdx: number
  ) => {
    const { numberPrimary } = playedCard;
    const { opponent } = getContextualPlayerIds(aiID);
    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    G.zones.forEach((z, zi) => {
      z.sides[opponent].forEach((c, cI) => {
        if (!c.booleans.isDestroyed && c.type === CardType.Minion) {
          possibleTargets.push({
            zoneNumber: zi,
            cardData: c,
            cardIndex: cI,
          });
        }
      });
    })

    if (possibleTargets.length !== 0) {
      const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;
      if (choice) {
        console.log(choice.cardData.name)
        G.zones[choice.zoneNumber].sides[opponent].forEach((c, cI) => {
          if (cardUuidMatch(c, choice.cardData)) {
            c.booleans.isDebuffed = true;
            c.booleans.hasHealthReduced = false;
            pushEventStream(c, c, 'wasDebuffed');
            pushHealthStreamAndSetDisplay(
              c,
              playedCard,
              playedCard.numberPrimary,
              playedCard.numberPrimary
            );
            // G.zones[choice.zoneNumber].sides[opponent][cI] = {
            //   ...G.zones[choice.zoneNumber].sides[opponent][cI],
            //   booleans: {
            //     ...G.zones[choice.zoneNumber].sides[opponent][cI].booleans,
            //     hasHealthReduced: false,
            //     isDebuffed: true,
            //   }
            // }
          }
        });

        G.zones[zoneNumber].sides[aiID].forEach((c, ci) => {
          if (cardUuidMatch(playedCard, c) && playedCardIdx === ci) {
            aiSpreadEventStreamAndOnPlayBoolean(
              G,
              ctx,
              aiID,
              zoneNumber,
              c,
              ci,
              choice.cardData,
              'onPlayWasTriggered'
            );
          }
        });
      }
    }
  },
};

export default core056;
