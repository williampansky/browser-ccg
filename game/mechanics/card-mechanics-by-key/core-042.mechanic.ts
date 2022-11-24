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
import { getCardHealth, getCardPower } from '../../../utils';

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
      if (c.uuid !== card.uuid) { // make sure not to buff itself
        if (c.type === CardType.Minion) { // make sure type matches
          c.healthStream.push({
            blame: card.name,
            adjustment: numberSecondary,
            currentHealth: add(c.displayHealth, numberSecondary),
          });
          c.powerStream.push({
            blame: card.name,
            adjustment: numberPrimary,
            currentPower: add(c.displayPower, numberPrimary),
          });

          c.displayPower = getCardPower(c);
          c.displayHealth = getCardHealth(c);
        }
      }
    });
  });
};
