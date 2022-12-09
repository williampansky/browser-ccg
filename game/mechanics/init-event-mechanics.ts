import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../types';
import { core008, core009, core012 } from './';

const initEventMechanics = (
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  if (!card) return;
  if (card.booleans.isDisabled) return;
  if (card.booleans.isSilenced) return;

  // prettier-ignore
  switch (card?.key) {
    case 'SET_CORE_008':
      core008.exec(G, ctx, zone, zoneIdx, card, cardIdx, player);
      break;
    case 'SET_CORE_009':
      core009.exec(G, ctx, zone, zoneIdx, card, cardIdx, player);
      break;
    case 'SET_CORE_012':
      core012.exec(G, ctx, zone, zoneIdx, card, cardIdx, player);
      break;
    // case 'SET_CORE_032':
    //   core032(G, ctx, zone, zoneIdx, card, cardIdx, player);
    //   break;
    // case 'SET_CORE_085':
    //   core085(G, ctx, zone, zoneIdx, card, cardIdx, player);
      // break;
    default:
      break;
  }
};

export default initEventMechanics;
