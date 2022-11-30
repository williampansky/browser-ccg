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
import { pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * buff +1 power whenever you play a minion card
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
  const { numberPrimary, powerStream } = card;

  G.zones.forEach((z, zIdx) => {
    z.sides[player].forEach((c, cIdx) => {
      const revealedThisTurn = c.revealedOnTurn === G.turn;
      const cardIsMinion = c.type === CardType.Minion;
      const cardNotInStream = !powerStream.find(o => o.uuid === c.uuid)

      if (c.uuid !== card.uuid) {
        // make sure to only check minions revealed this turn
        if (cardIsMinion && revealedThisTurn && cardNotInStream) {
          // find the core009 card node
          const self = G.zones[zoneIdx].sides[player][cardIdx];
          self.booleans.eventWasTriggered = true;

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
