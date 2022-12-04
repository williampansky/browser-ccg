import { Ctx } from 'boardgame.io';
import { GameState } from '../../../../types';
import { filterArray } from '../../../../utils';

export default function removeDestroyedCards(G: GameState, ctx: Ctx) {
  G.zones.forEach((zone, zI) => {
    // handle card deaths if health goes below zero
    zone.sides['0'].forEach((c, cI) => {
      if (c.booleans.isDestroyed) {
        filterArray(G.zones[zI].sides['0'], c.uuid, cI);
      }
    });

    // handle card deaths if health goes below zero
    zone.sides['1'].forEach((c, cI) => {
      if (c.booleans.isDestroyed) {
        filterArray(G.zones[zI].sides['1'], c.uuid, cI);
      }
    });
  });
}
