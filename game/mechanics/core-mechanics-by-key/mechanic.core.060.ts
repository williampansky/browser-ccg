import type { Ctx } from 'boardgame.io';
import { lte } from 'lodash';
import { subtract } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import {
  getContextualPlayerIds,
  getRandomNumberBetween as randomNumber,
  pushEventStream,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * deal random dmg to 2 targets
 */
const core060 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    player: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numberPrimary, numberSecondary, numberRNG } = playedCard;
    const { opponent } = getContextualPlayerIds(player);
    let possibleTargets: {
      zoneNumber: number;
      cardData: Card;
      cardIndex: number;
    }[] = [];

    G.zones[zoneNumber].sides[opponent].forEach((c, cI) => {
      if (!c.booleans.isDestroyed) {
        possibleTargets.push({
          zoneNumber: zoneNumber,
          cardData: c,
          cardIndex: cI,
        });
      }
    });

    // target loop
    for (let index = 0; index < numberRNG; index++) {
      // if there is a target
      if (possibleTargets.length !== 0) {
        // get a random one from the list
        const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;

        if (choice) {
          pushEventStream(playedCard, playedCard, 'onPlayWasTriggered');
          playedCard.booleans.onPlayWasTriggered = true;

          const rngDamage = randomNumber(numberPrimary, numberSecondary);
          choice.cardData.booleans.hasHealthReduced = true;
          pushHealthStreamAndSetDisplay(
            choice.cardData,
            playedCard,
            rngDamage,
            subtract(choice.cardData.displayHealth, rngDamage)
          );
        }
      }
    }

    const check = (c: Card) => {
      if (lte(c.displayHealth, 0)) {
        c.booleans.isDestroyed = true;
        c.destroyedOnTurn = G.turn;
      }
    };

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => check(c));
      z.sides[opponent].forEach((c) => check(c));
    });
  },
};

export default core060;

// export const core060 = (
//   G: GameState,
//   ctx: Ctx,
//   gameConfig: GameConfig,
//   zone: Zone,
//   zoneIdx: number,
//   card: Card,
//   cardIdx: number,
//   player: PlayerID,
//   opponent: PlayerID
// ) => {
//   const { numberPrimary, numberSecondary, numberRNG } = card;
//   let possibleTargets: {
//     zoneNumber: number;
//     cardData: Card;
//     cardIndex: number;
//   }[] = [];

//   G.zones[zoneIdx].sides[opponent].forEach((c, cIdx) => {
//     possibleTargets.push({
//       zoneNumber: zoneIdx,
//       cardData: c,
//       cardIndex: cIdx,
//     });
//   });

//   // target loop
//   for (let index = 0; index < numberRNG; index++) {
//     // if there is a target
//     if (possibleTargets.length !== 0) {
//       // get a random one from the list
//       const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;
//       const rngDamage = getRandomNumberBetween(numberPrimary, numberSecondary);
//       card.booleans.onPlayWasTriggered = true;
//       pushHealthStreamAndSetDisplay(
//         choice.cardData,
//         card,
//         rngDamage,
//         subtract(choice.cardData.displayHealth, rngDamage)
//       );
//     }
//   }
// };
