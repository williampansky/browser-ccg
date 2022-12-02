import { add } from 'mathjs';
import { gte } from 'lodash';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { cardIsNotSelf, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * on play: +num1 Power if you have num2 or more other cards here
 */
export const core005 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { displayPower, numberPrimary, numberSecondary } = card;
  let counter: number = 0;

  G.zones[zoneIdx].sides[player].forEach((c, ci) => {
    if (cardIsNotSelf(c, card)) counter++;
    else return;
  });

  if (gte(counter, numberSecondary)) {
    card.booleans.onPlayWasTriggered = true;
    pushPowerStreamAndSetDisplay(
      card,
      card,
      numberPrimary,
      add(displayPower, numberPrimary)
    );
  }
};
