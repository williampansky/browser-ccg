import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import core034 from '../../mechanics/core-mechanics-by-key/mechanic.core.034';
import core037 from '../../mechanics/core-mechanics-by-key/mechanic.core.037';

/**
 *
 */
export default function initGlobalEnergyMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_034':
      core034.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_037':
      core037.exec(G, ctx, player, zoneNumber, card);
      break;
  }
}
