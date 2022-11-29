import type { Ctx } from 'boardgame.io';
import { subtract } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import {
  handleCardDestructionMechanics,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * deal num1 dmg to a minion
 */
export const core053 = (
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
  G.zones.forEach((z) =>
    z.sides[opponent].forEach((c) => (c.booleans.canBeAttackedBySpell = true))
  );
};

export const core053Attack = (
  G: GameState,
  ctx: Ctx,
  opponent: PlayerID,
  cardToAttackUuid: string,
  cardToBlame: Card
) => {
  // prettier-ignore
  let target: {
    card: Card,
    cardIdx: number,
    zoneNumber: number
  } | undefined;

  G.zones.forEach((z, zi) => {
    z.sides[opponent].forEach((c, ci) => {
      if (c.uuid === cardToAttackUuid) {
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

    G.zones[zoneNumber].sides[opponent].forEach((c, ci) => {
      if (c.uuid === card.uuid) {
        pushHealthStreamAndSetDisplay(
          card,
          cardToBlame,
          cardToBlame.numberPrimary,
          subtract(card.displayHealth, cardToBlame.numberPrimary)
        );
      }
    });
  }

  G.zones.forEach((z, zi) =>
    z.sides[opponent].forEach((c, ci) => {
      c.booleans.canBeAttackedBySpell = false;
    })
  );
};
