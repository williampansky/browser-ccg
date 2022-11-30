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
    z.sides[opponent].forEach((c) => (c.booleans.canBeDestroyed = true));
    z.sides[player].forEach((c) => {
      if (c.uuid !== card.uuid) c.booleans.canBeDestroyed = true;
    });
  });
};

export const core043Destroy = (
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
    G.players[targetPlayer].cards.destroyed.push(card.key);

    // remove the target from the board zone side and its ref
    const newZoneArr = G.zones[zoneNumber].sides[targetPlayer].filter((c, ci) => {
      return c.uuid !== card.uuid && ci !== cardIdx;
    });

    G.zones[zoneNumber].sides[targetPlayer] = newZoneArr;
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
