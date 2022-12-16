import type { Ctx } from 'boardgame.io';
import type { GameState, Zone } from '../../types';
import zone001 from './zones/zone.001';

const initZoneMechanics = (
  G: GameState,
  ctx: Ctx,
  zone: Zone,
  zoneNumber: number
) => {
  switch (zone.id) {
    case '001':
      zone001.exec(G, ctx, zone, zoneNumber);
      break;
  }
};

export default initZoneMechanics;
