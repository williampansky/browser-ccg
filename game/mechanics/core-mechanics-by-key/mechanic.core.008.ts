import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../../types';
import { CardType } from '../../../enums';
import { cardIsNotSelf, pushEventStream, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * buff +1 power whenever you play a minion card
 */
const core008 = {
  exec: (
    G: GameState,
    ctx: Ctx,
    zone: Zone,
    zoneIndex: number,
    listenerCard: Card,
    listenerCardIndex: number,
    player: PlayerID
  ) => {
    const { numberPrimary, powerStream } = listenerCard;

    G.zones.forEach((z) => {
      z.sides[player].forEach((c) => {
        const revealedThisTurn = c.revealedOnTurn === G.turn;
        const cardIsMinion = c.type === CardType.Minion;
        const cardNotInStream = !powerStream.find((o) => o.uuid === c.uuid);

        if (cardIsNotSelf(c, listenerCard)) {
          if (cardIsMinion && revealedThisTurn && cardNotInStream) {
            // find the core008 card node
            const self = G.zones[zoneIndex].sides[player][listenerCardIndex];

            // set animations and bools
            pushEventStream(self, c, 'eventWasTriggered');
            if (!self.booleans.eventWasTriggered) {
              self.booleans.eventWasTriggered = true;
            }

            if (!self.booleans.isBuffed) {
              self.booleans.isBuffed = true;
            }

            if (!self.booleans.hasPowerIncreased) {
              self.booleans.hasPowerIncreased = true;
            }

            // push powerStream and set it
            pushPowerStreamAndSetDisplay(
              self,
              c,
              numberPrimary!,
              add(listenerCard.displayPower, numberPrimary!)
            );
          }
        }
      });
    });
  },
};

export default core008;
