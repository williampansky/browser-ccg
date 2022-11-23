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
import { getCardPower } from '../../../utils';

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
      if (c.uuid !== card.uuid) { // make sure not to buff itself
        if (c.race === CardRace.Sprite) { // make sure race matches
          c.powerStream.push({
            blame: card.name,
            adjustment: numberPrimary!,
            currentPower: add(c.displayPower, numberPrimary!),
          });

          c.displayPower = getCardPower(c);
        }
      }
    });
  });
};
