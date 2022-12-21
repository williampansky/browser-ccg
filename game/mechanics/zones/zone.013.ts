import type { Ctx } from 'boardgame.io';
import type { Card, CardBase, GameState, PlayerID, Zone } from '../../../types';
import { createCardObject } from '../../../utils';

import setsEntourage from '../../data/setsEntourage.json';

/**
 * Add two 10-Power %RACE_ELEMENT%s to each side
 */
const zone013 = {
  init: (G: GameState, ctx: Ctx, zone: Zone, zoneNumber: number) => {
    if (zone.revealed) {
      const entObj = setsEntourage.find((ent: CardBase) => {
        return ent.refId === zone.entourage[0];
      })!;

      if (entObj) {
        for (let index = 0; index < zone.effectAdjustment; index++) {
          zone013.summonMinion(G, zoneNumber, '0', {
            ...createCardObject(entObj),
            revealed: true,
          });
          
          zone013.summonMinion(G, zoneNumber, '1', {
            ...createCardObject(entObj),
            revealed: true,
          });
        }
      }
    }
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

export default zone013;
