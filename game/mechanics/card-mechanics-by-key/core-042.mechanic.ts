import { add } from 'mathjs';

import type { Ctx } from 'boardgame.io';
import type {
  Card,
  GameConfig,
  GameState,
  PlayerID,
  Zone,
} from '../../../types';
import { CardType } from '../../../enums';
import {
  pushPowerStreamAndSetDisplay,
  pushHealthStreamAndSetDisplay,
} from '../../../utils';

/**
 * your minions have +1/1
 */
export const core042 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const numberPrimary = card?.numberPrimary || 1;
  const numberSecondary = card?.numberSecondary || 1;

  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c, cIdx) => {
      // make sure not to buff itself
      if (c.uuid !== card.uuid) {
        // make sure type matches
        if (c.type === CardType.Minion) {
          pushHealthStreamAndSetDisplay(
            c,
            card,
            numberSecondary,
            add(c.displayHealth, numberSecondary)
          );
          pushPowerStreamAndSetDisplay(
            c,
            card,
            numberPrimary,
            add(c.displayPower, numberPrimary)
          );
        }
      }
    });
  });
};
