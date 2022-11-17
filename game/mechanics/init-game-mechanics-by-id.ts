import type { Ctx } from 'boardgame.io';
import type { Card, GameConfig, GameState, PlayerID, Zone } from '../../types';
import { game002 } from './card-mechanics-by-id/game-002.mechanic';
import { game003 } from './card-mechanics-by-id/game-003.mechanic';
import { game004 } from './card-mechanics-by-id/game-004.mechanic';
import { game005 } from './card-mechanics-by-id/game-005.mechanic';
import { game007 } from './card-mechanics-by-id/game-007.mechanic';
import { game014 } from './card-mechanics-by-id/game-014.mechanic';

const initGameMechanicsById = (
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

  switch (card?.id) {
    case 'GAME_002':
      return game002(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'GAME_003':
      return game003(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'GAME_004':
      return game004(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'GAME_005':
      return game005(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'GAME_007':
      return game007(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'GAME_014':
      return game014(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    default:
      return;
  }
};

export default initGameMechanicsById;
