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
import { getCardPower } from '../../../utils';

/**
 * buff +2 power whenever you play a sprite card
 */
export const core008 = (
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
      const revealedThisTurn = c.revealedOnTurn === G.turn;

      // make sure to only check sprites revealed this turn
      if (c.type === CardType.Minion && revealedThisTurn) {
        // find the core009 card node
        const self = G.zones[zoneIdx].sides[player][cardIdx];

        // push powerStream and set it
        self.powerStream.push({
          blame: c.name,
          adjustment: numberPrimary!,
          currentPower: add(card.displayPower, numberPrimary!),
        });
        self.displayPower = getCardPower(self);
      }
    });
  });
};
