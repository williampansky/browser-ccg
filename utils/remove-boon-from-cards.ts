import { subtract } from 'mathjs';
import { Card, GameState, PlayerID } from '../types';
import pushHealthStreamAndSetDisplay from './push-healthstream-and-set-display';
import pushPowerStreamAndSetDisplay from './push-powerstream-and-set-display';

/**
 * Loops thru all cards in every zone
 * and removes a boon from the provided card param.
 */
const removeBoonFromCards = (
  G: GameState,
  targetCard: Card,
  targetPlayer: PlayerID
): void => {
  // remove boons created by choice, if applicable
  G.zones.forEach((z, zIdx) => {
    z.sides[targetPlayer].forEach((c, cIdx) => {
      // if card has a powerStream matcher
      if (c.powerStream.find((s) => s.uuid === targetCard.uuid)) {
        const s = c.powerStream.find((s) => s.uuid === targetCard.uuid);
        pushPowerStreamAndSetDisplay(
          c,
          targetCard,
          s?.adjustment!,
          subtract(c.displayPower, s?.adjustment!)
        );
      }

      // if card has a healthStream matcher
      if (c.healthStream.find((s) => s.uuid === targetCard.uuid)) {
        const s = c.healthStream.find((s) => s.uuid === targetCard.uuid);
        pushHealthStreamAndSetDisplay(
          c,
          targetCard,
          s?.adjustment!,
          subtract(c.displayHealth, s?.adjustment!)
        );
      }
    });
  });
};

export default removeBoonFromCards;
