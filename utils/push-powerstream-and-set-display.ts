import { eq, gt, lt } from 'lodash';
import type { Card } from '../types';
import getCardPower from './get-card-power';

/**
 * Pushes to a card's powerStream and
 * sets the card's displayPower.
 */
const pushPowerStreamAndSetDisplay = (
  cardToAdjust: Card,
  cardToBlame: Card,
  adjustment: number,
  currentPower: number
): void => {
  // set boolean tag p1
  // const basePowerEqualsCurrentPower = eq(cardToAdjust.basePower, currentPower);
  // const displayPowerIsGreaterThanCurrentPower = gt(
  //   cardToAdjust.displayPower,
  //   currentPower
  // );
  // const displayPowerIsLessThanCurrentPower = lt(
  //   cardToAdjust.displayPower,
  //   currentPower
  // );

  // // set boolean tag p2
  // if (basePowerEqualsCurrentPower) {
  //   cardToAdjust.booleans.hasPowerIncreased = false;
  //   cardToAdjust.booleans.hasPowerReduced = false;
  // } else if (displayPowerIsGreaterThanCurrentPower) {
  //   cardToAdjust.booleans.hasPowerIncreased = true;
  //   cardToAdjust.booleans.hasPowerReduced = false;
  // } else if (displayPowerIsLessThanCurrentPower) {
  //   cardToAdjust.booleans.hasPowerIncreased = false;
  //   cardToAdjust.booleans.hasPowerReduced = true;
  // } else {
  //   cardToAdjust.booleans.hasPowerIncreased = false;
  //   cardToAdjust.booleans.hasPowerReduced = false;
  // }

  // push to stream
  cardToAdjust.powerStream.push({
    blame: cardToBlame.name,
    adjustment,
    currentPower,
    uuid: cardToBlame.uuid,
  });

  // set display value
  cardToAdjust.displayPower = getCardPower(cardToAdjust);
};

export default pushPowerStreamAndSetDisplay;
