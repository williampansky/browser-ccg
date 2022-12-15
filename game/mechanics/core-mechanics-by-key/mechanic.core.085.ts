import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { drawCardFromPlayersDeck, getContextualPlayerIds, pushEventStream, pushEventStreamAndSetBoolean } from '../../../utils';

/**
 * draw a card anytime a minion is healed
 */
export const core085 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    zoneIdx: number,
    card: Card,
    cardIdx: number,
    player: PlayerID
  ) => {
    const { opponent } = getContextualPlayerIds(player);

    G.zones.forEach((z, zIdx) => {
      z.sides[player].forEach((c, cIdx) => {
        if (c.booleans.wasHealed === true) {
          console.log(c.name, card.name, card.booleans.eventWasTriggered);
          drawCardFromPlayersDeck(G, player);
          pushEventStreamAndSetBoolean(
            G,
            ctx,
            player,
            zoneIdx,
            c,
            card,
            'eventWasTriggered'
          )
        }
      });

      z.sides[opponent].forEach((c, cIdx) => {
        if (c.booleans.wasHealed === true) {
          console.log(c.name, card.name, card.booleans.eventWasTriggered);
          drawCardFromPlayersDeck(G, opponent);
          pushEventStreamAndSetBoolean(
            G,
            ctx,
            opponent,
            zoneIdx,
            c,
            card,
            'eventWasTriggered'
          )
        }
      });
    });
  },
};
