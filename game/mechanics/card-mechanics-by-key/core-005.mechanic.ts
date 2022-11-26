import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { getCardPower, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * on play: +3 Power if you have 3 other cards here
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
  if (zone.sides[player].length >= 3) {
    pushPowerStreamAndSetDisplay(card, card, 3, add(card.displayPower, 3));
  }
};
