import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import core006 from '../../mechanics/core-mechanics-by-key/mechanic.core.006';
import core041 from '../../mechanics/core-mechanics-by-key/mechanic.core.041';

/**
 *
 */
export default function initGlobalDestroyMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_006':
      core006.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_041':
      core041.exec(G, ctx, player, zoneNumber, card);
      break;
  }
}
