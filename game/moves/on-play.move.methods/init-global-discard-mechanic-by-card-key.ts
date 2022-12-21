import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { discardRandomCardFromHandOnPlay } from '../../mechanics/on-play-mechanics';
import core133 from '../../mechanics/core-mechanics-by-key/mechanic.core.133';

/**
 *
 */
export default function initGlobalDiscardMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_118':
      discardRandomCardFromHandOnPlay(G, ctx, player, card);
      break;
    case 'SET_CORE_133':
      core133.exec(G, ctx, card, player);
      break;
  }
}
