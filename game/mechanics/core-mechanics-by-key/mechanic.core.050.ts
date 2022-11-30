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
 * deal num1 dmg to a minion and num2 to others in zone
 */
export const core050 = (
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
    z.sides[opponent].forEach((c) => (c.booleans.canBeAttackedBySpell = true));
    z.sides[player].forEach((c) => {
      if (c.uuid !== card.uuid) c.booleans.canBeAttackedBySpell = true;
    });
  });
};

export const core050Attack = (
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
      if (c.uuid === card.uuid && ci === cardIdx) {
        pushHealthStreamAndSetDisplay(
          c,
          cardToBlame,
          cardToBlame.numberPrimary,
          subtract(c.displayHealth, cardToBlame.numberPrimary)
        );
      } else {
        pushHealthStreamAndSetDisplay(
          c,
          cardToBlame,
          cardToBlame.numberSecondary,
          subtract(c.displayHealth, cardToBlame.numberSecondary)
        );
      }
    });

    G.zones.forEach((z, zi) => {
      z.sides['0'].forEach((c, ci) => {
        c.booleans.canBeAttackedBySpell = false;
        if (c.uuid === cardToBlame.uuid) c.booleans.onPlayWasTriggered = true;
      });
      z.sides['1'].forEach((c, ci) => {
        c.booleans.canBeAttackedBySpell = false;
      });
    });
  }
};
