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
import { pushPowerStreamAndSetDisplay } from '../../../utils';

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
  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c, cIdx) => {
      // make sure not to buff itself
      if (c.uuid !== card.uuid) {
        // make sure race matches
        if (c.race === CardRace.Creature) {
          c.booleans.canBeBuffed = true;
        }
      }
    });
  });
};

export const core031Buff = (
  G: GameState,
  ctx: Ctx,
  player: PlayerID,
  cardToBuff: Card,
  cardBuffedFrom: Card
) => {
  const { numberPrimary } = cardBuffedFrom;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (c.uuid === cardToBuff.uuid) {
        pushPowerStreamAndSetDisplay(
          cardToBuff,
          cardBuffedFrom,
          numberPrimary!,
          add(c.displayPower, numberPrimary!)
        );

        c.booleans.canBeBuffed = false;
      } else {
        c.booleans.canBeBuffed = false;
      }
    });
  });
};