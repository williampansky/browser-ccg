import type { Ctx } from 'boardgame.io';
import type { GameState } from '../../types';
import zone001 from './zones/zone.001';
import zone002 from './zones/zone.002';
import zone009 from './zones/zone.009';
import zone010 from './zones/zone.010';

/**
 * ***Handles*** zone mechanics; i.e. only mechanics that
 * need to be invoked multiple times per game.
 */
const handleZoneMechanics = (G: GameState, ctx: Ctx, context?: string) => {
  switch (context) {
    case 'onTurnBegin':
      G.zones.forEach((z, zi) => {
        if (z.revealed) {
          switch (z.id) {
            case 'z009':
              zone009.init(G, ctx, z);
              break;
          }
        }
      });
      break;
  
    default:
      G.zones.forEach((z, zi) => {
        if (z.revealed) {
          switch (z.id) {
            case 'z001':
              zone001.exec(G, ctx, z, zi);
              break;
            case 'z002':
              zone002.exec(G, ctx, z);
              break;
            case 'z010':
              zone010.exec(G, ctx, z, zi);
              break;
          }
        }
      });
      break;
  }
};

export default handleZoneMechanics;