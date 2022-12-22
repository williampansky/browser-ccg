import type { Ctx } from 'boardgame.io';
import type { GameState, Zone } from '../../types';
import { zones } from '../state';
import zone002 from './zones/zone.002';
import zone005 from './zones/zone.005';
import zone011 from './zones/zone.011';
import zone012 from './zones/zone.012';
import zone013 from './zones/zone.013';
import zone014 from './zones/zone.014';
import zone015 from './zones/zone.015';

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
  if (zone.revealed && zone.mechanicsEnabled) {
    switch (zone.id) {
      case 'z002':
        zone002.exec(G, ctx, zone);
        break;
      case 'z005':
        zone005.init(G, ctx, zone, zoneNumber);
        break;
      case 'z007':
        zones.disableZone(G, zoneNumber);
        break;
      case 'z011':
        zone011.init(G, ctx, zone);
        break;
      case 'z012':
        zone012.init(G, ctx, zone);
        break;
      case 'z013':
        zone013.init(G, ctx, zone, zoneNumber);
        break;
      case 'z014':
        zone014.init(G, ctx, zone);
        break;
      case 'z015':
        zone015.init(G, ctx, zone);
        break;
    }
  }
};

export default initZoneMechanics;
