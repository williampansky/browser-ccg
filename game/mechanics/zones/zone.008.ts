import { v4 as uuid } from 'uuid';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, Zone } from '../../../types';
import { getRandomNumberBetween } from '../../../utils';

/**
 * Cards played here are also played randomly at another %ZONE%
 */
const zone008 = {
  exec: (G: GameState, ctx: Ctx, zone: Zone, zoneNumber: number) => {
    const lastPlayedCard = G.lastCardPlayed?.card;
    if (zone.revealed && lastPlayedCard) {
      const minionDupe = zone008.createDuplicateMinion(lastPlayedCard);
      const zoneChoice = zone008.getRandomOtherZoneNumber(ctx, zoneNumber);
      if (minionDupe) zone008.summonMinion(G, ctx, zoneChoice, minionDupe);
    }
  },

  createDuplicateMinion(card: Card): Card {
    const dupe = { ...card, revealed: true, uuid: uuid() };
    return dupe;
  },

  /**
   * Makes sure to choose randomly between the zones other than itself
   */
  getRandomOtherZoneNumber(ctx: Ctx, zoneNumber: number): number {
    switch (zoneNumber) {
      case 0:
        return ctx.random?.Shuffle([1, 2])[0]!;
      case 1:
        return ctx.random?.Shuffle([0, 2])[0]!;
      case 2:
        return ctx.random?.Shuffle([0, 1])[0]!;
      default:
        return getRandomNumberBetween(0, 2);
    }
  },

  summonMinion(G: GameState, ctx: Ctx, zoneNumber: number, c: Card) {
    const { currentPlayer } = ctx;
    const perZone = G.gameConfig.numerics.numberOfSlotsPerZone;

    if (G.zones[zoneNumber].sides[currentPlayer].length < perZone) {
      G.zones[zoneNumber].sides[currentPlayer].push(c);
    }
  },
};

export default zone008;
