import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../types';

/**
 * This util simulates the functionality of both `pushEventStream()` and
 * setting the `booleans.onPlayWasTriggered`—but or the bot AI. This is
 * necessary as we can't modify the read-only properties of how the AI
 * sends cards through the framework.
 */
export default function aiSpreadEventStreamAndOnPlayBoolean(
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  cardToAdjust: Card,
  cardToBlame?: Card,
  event?: string
) {
  const cardToAdjustIdx = G.zones[zoneNumber].sides[player].findIndex((o) => {
    return o.uuid === cardToAdjust.uuid;
  });

  G.zones[zoneNumber].sides[player][cardToAdjustIdx] = {
    ...G.zones[zoneNumber].sides[player][cardToAdjustIdx],
    booleans: {
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].booleans,
      [`${event}`]: true,
    },
    eventStream: [
      ...G.zones[zoneNumber].sides[player][cardToAdjustIdx].eventStream,
      {
        blame: cardToBlame ? cardToBlame.name : cardToAdjust.name,
        event: 'onPlayWasTriggered',
        uuid: cardToBlame ? cardToBlame.uuid : cardToAdjust.uuid,
      },
    ],
  };
}
