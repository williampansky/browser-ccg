import type { Ctx } from 'boardgame.io';
import type { Card, GameConfig, GameState, PlayerID, Zone } from '../../types';
import { core002 } from './card-mechanics-by-key/core-002.mechanic';
import { core003 } from './card-mechanics-by-key/core-003.mechanic';
import { core004 } from './card-mechanics-by-key/core-004.mechanic';
import { core005 } from './card-mechanics-by-key/core-005.mechanic';
import { core007 } from './card-mechanics-by-key/core-007.mechanic';
import { core011 } from './card-mechanics-by-key/core-011.mechanic';
import { core014 } from './card-mechanics-by-key/core-014.mechanic';
import { core036 } from './card-mechanics-by-key/core-036.mechanic';

const initCardMechanicsByKey = (
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
    case 'SET_CORE_002':
      return core002(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_003':
      return core003(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_004':
      return core004(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_005':
      return core005(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_007':
      return core007(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_011':
      return core011(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_014':
      return core014(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    case 'SET_CORE_036':
      return core036(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    default:
      return;
  }
};

export default initCardMechanicsByKey;
