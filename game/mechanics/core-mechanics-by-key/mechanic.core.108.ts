import type { Ctx } from 'boardgame.io';
import { add } from 'mathjs';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * minions here get +2 power
 */
export const core108 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { numberPrimary } = card;

  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c) => {
      const zoneMatch = zIdx === zoneIdx;
      const cardIsNotSelf = c.uuid !== card.uuid;

      if (zoneMatch && cardIsNotSelf) {
        pushPowerStreamAndSetDisplay(
          c,
          card,
          numberPrimary,
          add(c.displayPower, numberPrimary)
        );
      }
    });
  });
};
