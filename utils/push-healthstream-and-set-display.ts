import { eq, gt, lt } from 'lodash';
import type { Card } from '../types';
import getCardHealth from './get-card-health';

/**
 * Pushes to a card's healthStream and
 * sets the card's displayHealth.
 */
const pushHealthStreamAndSetDisplay = (
  cardToAdjust: Card,
  cardToBlame: Card,
  adjustment: number,
  currentHealth: number
): void => {
  // set boolean tag p1
  // const baseHealthEqualsCurrentHealth = eq(
  //   cardToAdjust.baseHealth,
  //   currentHealth
  // );
  // const displayHealthIsGreaterThanCurrentHealth = gt(
  //   cardToAdjust.displayHealth,
  //   currentHealth
  // );
  // const displayHealthIsLessThanCurrentHealth = lt(
  //   cardToAdjust.displayHealth,
  //   currentHealth
  // );

  // // set boolean tag p2
  // if (baseHealthEqualsCurrentHealth) {
  //   cardToAdjust.booleans.hasHealthIncreased = false;
  //   cardToAdjust.booleans.hasHealthReduced = false;
  // } else if (displayHealthIsGreaterThanCurrentHealth) {
  //   cardToAdjust.booleans.hasHealthIncreased = true;
  //   cardToAdjust.booleans.hasHealthReduced = false;
  // } else if (displayHealthIsLessThanCurrentHealth) {
  //   cardToAdjust.booleans.hasHealthIncreased = false;
  //   cardToAdjust.booleans.hasHealthReduced = true;
  // } else {
  //   cardToAdjust.booleans.hasHealthIncreased = false;
  //   cardToAdjust.booleans.hasHealthReduced = false;
  // }

  // push to stream
  cardToAdjust.healthStream.push({
    blame: cardToBlame.name,
    adjustment,
    currentHealth,
    uuid: cardToBlame.uuid,
  });

  // set display value
  cardToAdjust.displayHealth = getCardHealth(cardToAdjust);
};

export default pushHealthStreamAndSetDisplay;
