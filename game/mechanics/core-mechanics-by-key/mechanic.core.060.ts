import { lte } from 'lodash';
import { subtract } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import {
  cardUuidMatch,
  getContextualPlayerIds,
  getRandomNumberBetween as randomNumber,
  pushEventStream,
  pushEventStreamAndSetBoolean,
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

  execAi: (
    G: GameState,
    ctx: Ctx,
    aiID: PlayerID,
    zoneNumber: number,
    playedCard: Card
  ) => {
    const { numberPrimary, numberSecondary, numberRNG } = playedCard;
    const { opponent } = getContextualPlayerIds(aiID);
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

          const rngDamage = randomNumber(numberPrimary, numberSecondary);
          choice.cardData.booleans.hasHealthReduced = true;
          pushHealthStreamAndSetDisplay(
            choice.cardData,
            playedCard,
            -rngDamage,
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
      z.sides[aiID].forEach((c) => check(c));
      z.sides[opponent].forEach((c) => check(c));
    });
  },
};

export default core060;
