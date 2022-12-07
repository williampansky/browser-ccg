import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { cardWasHealed, drawCardFromPlayersDeck, pushEventStream } from '../../../utils';
import { gt, gte } from 'lodash';

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
      if (c.booleans.wasHealed === true) {
        console.log(c.name, card.name, card.booleans.eventWasTriggered)
        drawCardFromPlayersDeck(G, player);
        card.booleans.eventWasTriggered = true;
        pushEventStream(card, c, 'eventWasTriggered');
        // card.booleans.eventWasTriggered = true;
      }
    });

    // z.sides[opponent].forEach((c, cIdx) => {
    //   if (cardWasHealed(c)) {
    //     drawCardFromPlayersDeck(G, player);
    //     // card.booleans.eventWasTriggered = true;
    //   }
    // });
  });
};
