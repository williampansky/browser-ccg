import type { Ctx } from 'boardgame.io';
import type { GameState, Zone } from '../../types';
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
    case '013':
      zone013.init(G, ctx, zone, zoneNumber);
      break;
  }
};

export default initZoneMechanics;
