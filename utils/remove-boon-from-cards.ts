import { lt } from 'lodash';
import { isNegative, isPositive, subtract } from 'mathjs';
import { Card, GameState, PlayerID } from '../types';
import filterArray from './filter-array';
import pushHealthStreamAndSetDisplay from './push-healthstream-and-set-display';
import pushPowerStreamAndSetDisplay from './push-powerstream-and-set-display';
import removeFromHealthStreamAndSetDisplay from './remove-from-healthstream-and-set-display';
import removeFromPowerStreamAndSetDisplay from './remove-from-powerstream-and-set-display';

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
      /**
       * Represents an object in the `c.healthStream` array whose
       * `object.uuid` matches that of the `targetCard.uuid`—meaning
       * that the `c` in the loop has been adjusted by the target card.
       */
      const cardHasHealthBoonFromTargetCard = c.healthStream?.find(
        (streamObject) => {
          return (
            streamObject.uuid === targetCard.uuid &&
            isPositive(streamObject.adjustment)
          );
        }
      );

      /**
       * Represents an object in the `c.powerStream` array whose
       * `object.uuid` matches that of the `targetCard.uuid`—meaning
       * that the `c` in the loop has been adjusted by the target card.
       */
      const cardHasPowerBoonFromTargetCard = c.powerStream?.find(
        (streamObject) => {
          return (
            streamObject.uuid === targetCard.uuid &&
            isPositive(streamObject.adjustment)
          );
        }
      );

      // if card has a powerStream matcher
      if (cardHasPowerBoonFromTargetCard) {
        removeFromPowerStreamAndSetDisplay(c, targetCard);
      }

      // if card has a healthStream matcher
      if (cardHasHealthBoonFromTargetCard) {
        removeFromHealthStreamAndSetDisplay(c, targetCard);
      }
    });
  });
};

export default removeBoonFromCards;
