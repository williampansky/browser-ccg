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
      const zoneMatch = zIdx === zoneIdx;
      const isNotSelf = c.uuid !== card.uuid;
      const isSprite = c.race === CardRace.Sprite;

      if (zoneMatch && isNotSelf && isSprite) {
        card.booleans.onPlayWasTriggered = true;
        pushPowerStreamAndSetDisplay(
          c,
          card,
          numberPrimary!,
          add(c.displayPower, numberPrimary!)
        );
      }
    });
  });
};
