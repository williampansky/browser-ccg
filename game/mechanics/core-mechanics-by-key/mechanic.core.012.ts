import { add } from 'mathjs';
import type { Ctx } from 'boardgame.io';
import type { Card, GameState, PlayerID, Zone } from '../../../types';
import { CardType } from '../../../enums';
import { pushEventStream, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * buff +num1 power whenever you play a spell card
 */
const core012 = {
  exec: (
    G: GameState,
    ctx: Ctx,
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
        const cardIsASpell = c.type === CardType.Spell;
        const cardNotInStream = !powerStream.find((o) => o.uuid === c.uuid);
        const cardIsNotSelf = c.uuid !== card.uuid;

        const requirementsMet = (): boolean => {
          return (
            cardIsNotSelf && cardIsASpell && cardNotInStream && revealedThisTurn
          );
        };

        if (requirementsMet()) {
          // find the core012 card node
          const self = G.zones[zoneIdx].sides[player][cardIdx];

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
            add(card.displayPower, numberPrimary!)
          );
        }
      });
    });
  },
};

export default core012;
