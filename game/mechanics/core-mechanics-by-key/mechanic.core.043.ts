import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { handleCardDestructionMechanics } from '../../../utils';

/**
 * destroy a minion
 */
export const core043 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID
) => {
  G.zones.forEach((z) => {
    z.sides[opponent].forEach((c) => {
      c.booleans.canBeDestroyed = true;
    });
  });
};

export const core043Destroy = (
  G: GameState,
  ctx: Ctx,
  opponent: PlayerID,
  cardToDestroyUuid: string,
) => {
  let target: {
    card: Card,
    cardIdx: number,
    zoneNumber: number
  } | undefined;

  G.zones.forEach((z, zi) => {
    z.sides[opponent].forEach((c, ci) => {
      if (c.uuid === cardToDestroyUuid) {
        target = {
          card: c,
          cardIdx: ci,
          zoneNumber: zi
        }
      }
    })
  })

  if (target !== undefined) {
    const { card, cardIdx, zoneNumber } = target;

    // push to opponents destroyed arr
    G.players[opponent].cards.destroyed.push(card.key);
  
    // remove the target from the board zone side and its ref
    const newZoneArr = G.zones[zoneNumber].sides[opponent].filter((c) => {
      return c.uuid !== card.uuid;
    });
  
    G.zones[zoneNumber].sides[opponent] = newZoneArr;
    G.zonesCardsReference[zoneNumber][opponent] = newZoneArr;
    handleCardDestructionMechanics(G, card, opponent);
  }
};
