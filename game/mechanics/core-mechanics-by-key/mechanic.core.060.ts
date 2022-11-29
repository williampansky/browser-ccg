import type { Ctx } from 'boardgame.io';
import { subtract } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import {
  getRandomNumberBetween,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * deal random dmg to 2 targets
 */
export const core060 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID
) => {
  const { numberPrimary, numberSecondary, numberRNG } = card;
  let possibleTargets: {
    zoneNumber: number;
    cardData: Card;
    cardIndex: number;
  }[] = [];

  card.booleans.onPlayWasTriggered = true;

  G.zones[zoneIdx].sides[opponent].forEach((c, cIdx) => {
    possibleTargets.push({
      zoneNumber: zoneIdx,
      cardData: c,
      cardIndex: cIdx,
    });
  });

  // target loop
  for (let index = 0; index < numberRNG; index++) {
    // if there is a target
    if (possibleTargets.length !== 0) {
      // get a random one from the list
      const choice = ctx?.random?.Shuffle(possibleTargets)[0]!;
      const rngDamage = getRandomNumberBetween(numberPrimary, numberSecondary);
      pushHealthStreamAndSetDisplay(
        choice.cardData,
        card,
        rngDamage,
        subtract(choice.cardData.displayHealth, rngDamage)
      );
    }
  }
};
