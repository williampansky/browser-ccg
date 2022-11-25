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
 * boon: your other sprites have +2 attack power
 */
export const core010 = (
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
    z.sides[player].forEach((c, cIdx) => {
      // make sure not to buff itself
      if (c.uuid !== card.uuid) {
        // make sure race matches
        if (c.race === CardRace.Sprite) {
          pushPowerStreamAndSetDisplay(
            c,
            card,
            numberPrimary!,
            add(c.displayPower, numberPrimary!)
          );
        }
      }
    });
  });
};
