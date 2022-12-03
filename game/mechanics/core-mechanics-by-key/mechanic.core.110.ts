import type { Ctx } from 'boardgame.io';
import { multiply } from 'mathjs';
import { CardType } from '../../../enums';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * double a minion's attack power
 */
export const core110 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID,
  opponent: PlayerID,
) => {
  G.zones.forEach((z) => {
    z.sides[opponent].forEach((c) => {
      const isNotSelf = c.uuid !== card.uuid;
      const isMinion = c.type === CardType.Minion;
      if (isNotSelf && isMinion) c.booleans.canBeBuffed = true;
    });

    z.sides[player].forEach((c) => {
      const isNotSelf = c.uuid !== card.uuid;
      const isMinion = c.type === CardType.Minion;
      if (isNotSelf && isMinion) c.booleans.canBeBuffed = true;
    });
  });
};

export const core110Buff = (
  G: GameState,
  ctx: Ctx,
  targetPlayer: PlayerID,
  cardToBuffUuid: string,
  cardBuffedFrom: Card
) => {
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
        pushPowerStreamAndSetDisplay(
          c,
          cardBuffedFrom,
          multiply(c.displayPower, 2),
          multiply(c.displayPower, 2)
        );
      }
    });
  }

  G.zones.forEach((z, zi) => {
    z.sides['0'].forEach((c, ci) => {
      c.booleans.canBeBuffed = false;
      if (c.uuid === cardBuffedFrom.uuid) c.booleans.onPlayWasTriggered = true;
    });

    z.sides['1'].forEach((c, ci) => {
      c.booleans.canBeBuffed = false;
    });
  });
};
