import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID, Zone } from '../../../types';
import { createCardObject } from '../../../utils';

import setsEntourage from '../../data/setsEntourage.json';

const zone013 = {
  init: (G: GameState, ctx: Ctx, zone: Zone, zoneNumber: number) => {
    for (let index = 0; index < zone.effectAdjustment; index++) {
      const minion = zone013.createMinion(zone);
      zone013.summonMinion(G, zoneNumber, '0', minion);
      zone013.summonMinion(G, zoneNumber, '1', minion);
    }
  },

  createMinion(zone: Zone): Card {
    const entArr = setsEntourage.find((ent: CardBase) => {
      return ent.refId === zone.entourage[0];
    });

    return { ...createCardObject(entArr!), revealed: true };
  },

  summonMinion(G: GameState, zoneNumber: number, player: PlayerID, c: Card) {
    G.zones[zoneNumber].sides[player].push(c);
  },
};

export default zone013;
