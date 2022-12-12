import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../types';
import isBotTurn from './is-bot-turn';
import pushEventStream from './push-eventstream';
import aiSpreadEventStreamAndOnPlayBoolean from './ai-spread-event-stream-and-onplay-boolean';

/**
 * Wrapper util for `pushEventStream` which first determines if the move
 * is coming from the bot AI or a player and then resolves accordingly.
 */
const pushEventStreamAndSetBoolean = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  zoneNumber: number,
  cardToAdjust: Card,
  cardToBlame: Card,
  event: string
): void => {
  if (isBotTurn(ctx)) {
    aiSpreadEventStreamAndOnPlayBoolean(
      G,
      ctx,
      player,
      zoneNumber,
      cardToAdjust,
      cardToBlame,
      event
    );
  } else {
    pushEventStream(cardToAdjust, cardToBlame, event);
  }
};

export default pushEventStreamAndSetBoolean;
