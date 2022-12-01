import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { CardRace } from '../../../enums';
import {
  getContextualPlayerIds,
  pushPowerStreamAndSetDisplay,
} from '../../../utils';

/**
 * boon: give a creature +4 attack power
 */
export const core031 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { opponent } = getContextualPlayerIds(player);
  G.zones.forEach((z) => {
    z.sides[opponent].forEach((c) => {
      const isNotSelf = c.uuid !== card.uuid;
      const isCreature = c.race === CardRace.Creature;
      if (isNotSelf && isCreature) c.booleans.canBeBuffed = true;
    });

    z.sides[player].forEach((c) => {
      const isNotSelf = c.uuid !== card.uuid;
      const isCreature = c.race === CardRace.Creature;
      if (isNotSelf && isCreature) c.booleans.canBeBuffed = true;
    });
  });
};

export const core031Buff = (
  G: GameState,
  ctx: Ctx,
  targetPlayer: PlayerID,
  cardToBuffUuid: string,
  cardBuffedFrom: Card
) => {
  const { numberPrimary } = cardBuffedFrom;
  // prettier-ignore
  let target: {
    card: Card,
    cardIdx: number,
    zoneNumber: number
  } | undefined;

  G.zones.forEach((z, zi) => {
    z.sides[targetPlayer].forEach((c, ci) => {
      if (c.uuid === cardToBuffUuid) {
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
        pushPowerStreamAndSetDisplay(
          c,
          cardBuffedFrom,
          numberPrimary,
          add(c.displayPower, 2)
        );
      }
    });
  }

  G.zones.forEach((z, zi) => {
    z.sides['0'].forEach((c) => (c.booleans.canBeBuffed = false));
    z.sides['1'].forEach((c) => (c.booleans.canBeBuffed = false));
  });
};
