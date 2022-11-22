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
 * on turn end, give a friendly sprite +1 power
 */
export const core013 = (
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
      if (c.uuid !== card.uuid) { // make sure not to buff itself
        if (c.race === CardRace.Sprite) { // make sure race matches
          c.powerStream.push({
            blame: card.name,
            adjustment: 1,
            currentPower: add(c.displayPower, 1),
          });
      
          c.displayPower = getCardPower(c);
        }
      }
    })
  });
};
