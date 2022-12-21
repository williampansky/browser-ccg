import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import core014 from '../../mechanics/core-mechanics-by-key/mechanic.core.014';

/**
 *
 */
export default function initGlobalSetCostMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_014':
      core014.exec(G, ctx, player, zoneNumber, card);
      break;
  }
}
