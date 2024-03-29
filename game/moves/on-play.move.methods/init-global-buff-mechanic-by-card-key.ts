import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import { buffPowerOfCardsInZone } from '../../mechanics/on-play-mechanics';
import core005 from '../../mechanics/core-mechanics-by-key/mechanic.core.005';
import core029 from '../../mechanics/core-mechanics-by-key/mechanic.core.029';

/**
 *
 */
export default function initGlobalBuffMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_005':
      core005.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_029':
      core029.exec(G, ctx, player, zoneNumber, card);
      break;
    default:
      buffPowerOfCardsInZone(G, ctx, zoneNumber, card, player);
      break;
  }
}
