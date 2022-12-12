import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID } from '../../../types';
import core004 from '../../mechanics/core-mechanics-by-key/mechanic.core.004';
import core011 from '../../mechanics/core-mechanics-by-key/mechanic.core.011';
import core019 from '../../mechanics/core-mechanics-by-key/mechanic.core.019';

/**
 *
 */
export default function initGlobalAddCardMechanicByCardKey(
  G: GameState,
  ctx: Ctx,
  zoneNumber: number,
  card: Card,
  player: PlayerID
) {
  switch (card.key) {
    case 'SET_CORE_004':
      core004.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_011':
      core011.exec(G, ctx, player, zoneNumber, card);
      break;
    case 'SET_CORE_019':
    case 'SET_CORE_039':
      core019.exec(G, ctx, player, zoneNumber, card);
      break;
  }
}
