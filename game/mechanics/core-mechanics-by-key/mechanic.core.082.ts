import type { Ctx } from 'boardgame.io';
import { add } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import {
  limitNumberWithinRange,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * heal a minion for num1 hp
 */
export const core082 = (
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
      if (c.uuid !== card.uuid && c.booleans.hasHealthReduced) {
        c.booleans.canBeHealed = true;
      }
    });
    z.sides[opponent].forEach((c) => {
      if (c.booleans.hasHealthReduced) c.booleans.canBeHealed = true;
    });
  });
};

export const core082Heal = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  targetPlayer: PlayerID,
  cardToHealUuid: string,
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
      if (c.uuid === cardToHealUuid) {
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

    G.zones[zoneNumber].sides[targetPlayer].forEach((c, ci) => {
      if (c.uuid === card.uuid) {
        card.booleans.onPlayWasTriggered = true;
        pushHealthStreamAndSetDisplay(
          c,
          cardToBlame,
          cardToBlame.numberPrimary,
          limitNumberWithinRange(
            add(c.displayHealth, cardToBlame.numberPrimary),
            c.baseHealth,
            cardToBlame.numberPrimary
          )
        );
      }
    });
  }

  G.zones.forEach((z, zi) => {
    z.sides['0'].forEach((c) => (c.booleans.canBeHealed = false));
    z.sides['1'].forEach((c) => (c.booleans.canBeHealed = false));
  });
};
