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
 * on play: debuff your other cards here with -1 Power
 */
export const game002 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  G.zones[zoneIdx].sides[player].forEach((c: Card, i: number) => {
    const isNotCardPlayed = card.uuid !== c.uuid;
    const cardIsBeforeCardPlayed = cardIdx > i;

    if (isNotCardPlayed && cardIsBeforeCardPlayed) {
      c.powerStream.push({
        blame: 'GAME_002',
        adjustment: -1,
        currentPower: add(c.displayPower, -1),
      });

      c.displayPower = getCardPower(c);
    }
  });
};
