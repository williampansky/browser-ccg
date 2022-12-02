import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { cardIsNotSelf, filterArray, handleCardDestructionMechanics } from '../../../utils';
import { counts } from '../../state';

/**
 * destroy an already damaged minion
 */
export const core126 = (
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
    z.sides[player].forEach((c) => {
      if (cardIsNotSelf(c, card) && c.booleans.hasHealthReduced) {
        c.booleans.canBeDestroyed = true;
      }
    });

    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, card) && c.booleans.hasHealthReduced) {
        c.booleans.canBeDestroyed = true;
      }
    });
  });
};

export const core126Destroy = (
  G: GameState,
  ctx: Ctx,
  targetPlayer: PlayerID,
  cardToDestroyUuid: string,
  cardToBlame: Card
) => {
  // prettier-ignore
  let target: {
    card: Card,
    cardIdx: number,
    zoneNumber: number
  } | undefined;

  G.zones.forEach((z, zi) => {
    z.sides[targetPlayer].forEach((c, ci) => {
      if (c.uuid === cardToDestroyUuid) {
        target = {
          card: c,
          cardIdx: ci,
          zoneNumber: zi,
        };
      }
    });
  });

  if (target !== undefined) {
    const { card, cardIdx, zoneNumber } = target;

    // push to targetPlayers destroyed arr
    G.players[targetPlayer].cards.destroyed.push(card);
    counts.incrementDestroyed(G, targetPlayer);

    filterArray(G.zones[zoneNumber].sides[targetPlayer], card.uuid, cardIdx);
    handleCardDestructionMechanics(G, card, targetPlayer);
  }

  G.zones.forEach((z, zi) => {
    z.sides['0'].forEach((c, ci) => {
      c.booleans.canBeDestroyed = false;
      if (c.uuid === cardToBlame.uuid) c.booleans.onPlayWasTriggered = true;
    });

    z.sides['1'].forEach((c, ci) => {
      c.booleans.canBeDestroyed = false;
    });
  });
};
