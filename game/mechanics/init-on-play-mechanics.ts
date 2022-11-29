import type { Ctx } from 'boardgame.io';
import type { Card, GameConfig, GameState, PlayerID, Zone } from '../../types';
import { CtxWithEffects } from '../game';

import { core002 } from './card-mechanics-by-key/core-002.mechanic';
import { core003 } from './card-mechanics-by-key/core-003.mechanic';
import { core004 } from './card-mechanics-by-key/core-004.mechanic';
import { core005 } from './card-mechanics-by-key/core-005.mechanic';
import { core006 } from './card-mechanics-by-key/core-006.mechanic';
import { core007 } from './card-mechanics-by-key/core-007.mechanic';
import { core010 } from './card-mechanics-by-key/core-010.mechanic';
import { core011 } from './card-mechanics-by-key/core-011.mechanic';
import { core014 } from './card-mechanics-by-key/core-014.mechanic';
import { core025 } from './card-mechanics-by-key/core-025.mechanic';
import { core029 } from './card-mechanics-by-key/core-029.mechanic';
import { core031 } from './core-mechanics-by-key/mechanic.core.031';
import { core036 } from './card-mechanics-by-key/core-036.mechanic';
import { core037 } from './card-mechanics-by-key/core-037.mechanic';
import { core039 } from './card-mechanics-by-key/core-039.mechanic';
import { core040 } from './card-mechanics-by-key/core-040.mechanic';
import { core041 } from './card-mechanics-by-key/core-041.mechanic';
import { core042 } from './card-mechanics-by-key/core-042.mechanic';
import { core043 } from './core-mechanics-by-key/mechanic.core.043';
import { core110 } from './core-mechanics-by-key/mechanic.core.110';
import { core118 } from './core-mechanics-by-key/mechanic.core.118';
import { core122 } from './core-mechanics-by-key/mechanic.core.122';
import { core034 } from './core-mechanics-by-key/mechanic.core.034';
import { core044 } from './core-mechanics-by-key/mechanic.core.044';

const initOnPlayMechanics = (
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
    case 'SET_CORE_026':
      return core003(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_004':
      return core004(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_005':
      return core005(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_006':
      return core006(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    case 'SET_CORE_007':
      return core007(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_010':
      return core010(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_011':
      return core011(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_014':
      return core014(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    case 'SET_CORE_025':
      return core025(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_029':
      return core029(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_031':
      return core031(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_034':
      return core034(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_036':
      return core036(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_037':
      return core037(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_019':
    case 'SET_CORE_039':
      return core039(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    case 'SET_CORE_040':
      return core040(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_041':
      return core041(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    case 'SET_CORE_042':
      return core042(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_043':
      return core043(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    case 'SET_CORE_044':
      return core044(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    case 'SET_CORE_110':
      return core110(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_118':
      return core118(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
    case 'SET_CORE_122':
      return core122(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
    default:
      return;
  }
};

export default initOnPlayMechanics;
