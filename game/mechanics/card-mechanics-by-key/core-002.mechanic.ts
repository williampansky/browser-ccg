import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * on play: debuff your other cards here with -1 Power
 */
export const core002 = (
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
      pushPowerStreamAndSetDisplay(c, card, -1, add(c.displayPower, -1));
    }
  });
};
