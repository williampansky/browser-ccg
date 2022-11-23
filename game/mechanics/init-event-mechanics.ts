import type { Ctx } from 'boardgame.io';
import type { Card, GameConfig, GameState, PlayerID, Zone } from '../../types';
import { core008 } from './card-mechanics-by-key/core-008.mechanic';
import { core009 } from './card-mechanics-by-key/core-009.mechanic';
import { core012 } from './card-mechanics-by-key/core-012.mechanic';

const initEventMechanics = (
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
    case 'SET_CORE_008':
      return core008(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_009':
      return core009(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_012':
      return core012(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    default:
      return;
  }
};

export default initEventMechanics;
