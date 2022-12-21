import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID, Zone } from '../../../types';
import { createCardObject } from '../../../utils';

import setsEntourage from '../../data/setsEntourage.json';

/**
 * Add three 1/1 %RACE_DEMONIC% minions here
 */
const zone005 = {
  init: (G: GameState, ctx: Ctx, zone: Zone, zoneNumber: number) => {
    if (zone.revealed) {
      for (let index = 0; index < zone.effectAdjustment; index++) {
        const minion = zone005.createMinion(zone);
        if (minion) {
          zone005.summonMinion(G, zoneNumber, '0', minion);
          zone005.summonMinion(G, zoneNumber, '1', minion);
        }
      }
    }
  },

  createMinion(zone: Zone): Card | undefined {
    const entObj = setsEntourage.find((ent: CardBase) => {
      return ent.refId === zone.entourage[0];
    })!;

    return { ...createCardObject(entObj), revealed: true }
  },

  summonMinion(G: GameState, zoneNumber: number, player: PlayerID, c: Card) {
    const {
      numerics: { numberOfSlotsPerZone },
    } = G.gameConfig;
    
    if (G.zones[zoneNumber].sides[player].length < numberOfSlotsPerZone) {
      G.zones[zoneNumber].sides[player].push(c);
    }
  },
};

export default zone005;
