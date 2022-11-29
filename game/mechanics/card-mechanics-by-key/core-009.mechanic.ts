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
import { getCardPower, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * buff +2 power whenever you play a sprite card
 */
export const core009 = (
  G: GameState,
  ctx: Ctx,
  gameConfig: GameConfig,
  zone: Zone,
  zoneIdx: number,
  card: Card,
  cardIdx: number,
  player: PlayerID
) => {
  const { numberPrimary, powerStream } = card;
  
  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c, cIdx) => {
      const cardIsntSelf = c.uuid !== card.uuid;
      if (cardIsntSelf) {
        const revealedThisTurn = c.revealedOnTurn === G.turn;
        const cardIsSprite = c.race === CardRace.Sprite;
        const cardNotInStream = !powerStream.find(o => o.uuid === c.uuid);

        // make sure to only check sprites revealed this turn
        if (cardIsSprite && revealedThisTurn && cardNotInStream) {
          // find the core009 card node
          const self = G.zones[zoneIdx].sides[player][cardIdx];
  
          // push powerStream and set it
          pushPowerStreamAndSetDisplay(
            self,
            c,
            numberPrimary!,
            add(card.displayPower, numberPrimary!)
          );
        }
      }
    });
  });
};
