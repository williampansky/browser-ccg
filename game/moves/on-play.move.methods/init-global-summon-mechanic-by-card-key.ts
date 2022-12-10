import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { core007 } from '../../mechanics';

/**
 *
 */
export default function initGlobalSummonMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_007':
      core007.exec(G, ctx, player, zoneNumber, card);
      break;
  }
}
