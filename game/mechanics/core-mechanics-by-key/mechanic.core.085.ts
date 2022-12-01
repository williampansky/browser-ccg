import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { drawCardFromPlayersDeck } from '../../../utils';
import { gt, gte } from 'lodash';

const wasHealed = (c: Card) => {
  if (gte(c.healthStream.length, 2)) {
    return gt(
      c.healthStream[c.healthStream.length - 1]?.currentHealth,
      c.healthStream[c.healthStream.length - 2]?.currentHealth
    );
  }
}

/**
 * draw a card anytime a minion is healed
 */
export const core085 = (
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
  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c, cIdx) => {
      if (wasHealed(c)) {
        drawCardFromPlayersDeck(G, player);
        card.booleans.eventWasTriggered = true;
      }
    });

    z.sides[opponent].forEach((c, cIdx) => {
      if (wasHealed(c)) {
        drawCardFromPlayersDeck(G, player);
        card.booleans.eventWasTriggered = true;
      }
    });
  });
};
