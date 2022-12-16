import type { Ctx } from 'boardgame.io';
import type { GameState, Zone } from '../../types';
import zone001 from './zones/zone.001';

const handleZoneMechanics = (
  G: GameState,
  ctx: Ctx,
) => {
  G.zones.forEach((z, zi) => {
    switch (z.id) {
      case '001':
        zone001.exec(G, ctx, z, zi);
        break;
    }
  })
};

export default handleZoneMechanics;
