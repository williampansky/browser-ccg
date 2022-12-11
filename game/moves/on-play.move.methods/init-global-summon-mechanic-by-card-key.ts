import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { core007, core025 } from '../../mechanics';
import { core036 } from '../../mechanics/core-mechanics-by-key/mechanic.core.036';

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
    case 'SET_CORE_025':
      core025.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_036':
      core036.exec(G, ctx, player, zoneNumber, card);
      break;
  }
}
