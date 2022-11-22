import type { Ctx } from 'boardgame.io';
import type { Card, GameConfig, GameState, PlayerID, Zone } from '../../types';

import { core013 } from './card-mechanics-by-key/core-013.mechanic';

const initOnTurnEndMechanics = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID
) => {
  if (!card) return;

  // prettier-ignore
  switch (card?.key) {
    case 'SET_CORE_013':
      return core013(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    default:
      return;
  }
};

export default initOnTurnEndMechanics;
