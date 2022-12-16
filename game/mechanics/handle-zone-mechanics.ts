import type { Ctx } from 'boardgame.io';
import type { GameState } from '../../types';
import zone001 from './zones/zone.001';
import zone002 from './zones/zone.002';

/**
 * ***Handles*** zone mechanics; i.e. only mechanics that
 * need to be invoked multiple times per game.
 */
const handleZoneMechanics = (G: GameState, ctx: Ctx) => {
  G.zones.forEach((z, zi) => {
    if (z.revealed) {
      switch (z.id) {
        case 'z001':
          zone001.exec(G, ctx, z, zi);
          break;
        case 'z002':
          zone002.exec(G, ctx, z);
          break;
      }
    }
  });
};

export default handleZoneMechanics;
