import type { Ctx } from 'boardgame.io';
import type { GameState, Zone } from '../../types';
import { zones } from '../state';
import zone002 from './zones/zone.002';
import zone013 from './zones/zone.013';

/**
 * ***Initiates*** zone mechanics; i.e. only mechanics that
 * need to be invoked once per game.
 */
const initZoneMechanics = (
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneNumber: number
) => {
  switch (zone.id) {
    case 'z002':
      zone002.exec(G, ctx, zone);
      break;
    case 'z007':
      zones.disableZone(G, zoneNumber);
      break;
    case 'z013':
      zone013.init(G, ctx, zone, zoneNumber);
      break;
  }
};

export default initZoneMechanics;
