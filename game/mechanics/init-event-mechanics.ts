import type { Ctx } from 'boardgame.io';
import type { Card, GameConfig, GameState, PlayerID, Zone } from '../../types';
import { drawCardFromPlayersDeck } from '../../utils';
import { core008 } from './card-mechanics-by-key/core-008.mechanic';
import { core009 } from './card-mechanics-by-key/core-009.mechanic';
import { core012 } from './card-mechanics-by-key/core-012.mechanic';
import { core032 } from './card-mechanics-by-key/core-032.mechanic';
import { core085 } from './core-mechanics-by-key/mechanic.core.085';

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
  if (card.booleans.isDisabled) return;
  if (card.booleans.isSilenced) return;

  // prettier-ignore
  switch (card?.key) {
    case 'SET_CORE_008':
      core008(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
      break;
    case 'SET_CORE_009':
      core009(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
      break;
    case 'SET_CORE_012':
      core012(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
      break;
    case 'SET_CORE_032':
      core032(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player);
      break;
    case 'SET_CORE_085':
      core085(G, ctx, gameConfig, zone, zoneIdx, card, cardIdx, player, opponent);
      break;
    default:
      break;
  }
};

export default initEventMechanics;
