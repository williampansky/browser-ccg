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
import { getCardPower, pushPowerStreamAndSetDisplay } from '../../../utils';

/**
 * buff +2 power whenever you play a spell card
 */
export const core012 = (
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
      const cardIsASpell = c.type === CardType.Spell;
      const cardNotInStream = !powerStream.find((o) => o.uuid === c.uuid);

      // make sure to only check spells revealed this turn
      if (cardIsASpell && revealedThisTurn && cardNotInStream) {
        // find the core012 card node
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
    });
  });
};
