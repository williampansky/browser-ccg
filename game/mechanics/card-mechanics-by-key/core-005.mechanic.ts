import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';

import { getCardPower } from '../../../utils';

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
    card.powerStream.push({
      blame: 'GAME_005',
      adjustment: 3,
      currentPower: add(card.displayPower, 3),
    });

    card.displayPower = getCardPower(card);
  }
};
