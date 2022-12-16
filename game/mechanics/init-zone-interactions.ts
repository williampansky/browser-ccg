import type { Ctx } from 'boardgame.io';
import type { GameState, Zone } from '../../types';
import zone001 from './zones/zone.001';
import zone013 from './zones/zone.013';

const initZoneMechanics = (
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneNumber: number
) => {
  switch (zone.id) {
    // case '001':
    //   zone001.exec(G, ctx, zone, zoneNumber);
    //   break;
    case '013':
      zone013.init(G, ctx, zone, zoneNumber);
      break;
  }
};

export default initZoneMechanics;
