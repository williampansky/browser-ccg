import { gt, gte, lt } from 'lodash';
import { subtract } from 'mathjs';
import type { Card } from '../types';
import filterArray from './filter-array';
import getCardPower from './get-card-power';

/**
 * Removes an entry to a card's healthStream
 * and sets the card's displayPower.
 */
const removeFromHealthStreamAndSetDisplay = (
  cardToAdjust: Card,
  cardToBlame: Card
): void => {
  const { healthStream } = cardToAdjust;
  const obj = healthStream.find((s) => s.uuid === cardToBlame.uuid)!;
  const idx = healthStream.findIndex((s) => s.uuid === cardToBlame.uuid);

  // set bools and new values
  if (gte(healthStream.length, 2)) {
    const lastObj = healthStream[healthStream.length - 1];
    const adjustment = subtract(lastObj.currentHealth, obj.adjustment)
    cardToAdjust.displayHealth = adjustment;
  } else {
    cardToAdjust.displayHealth = cardToAdjust.baseHealth;
    cardToAdjust.booleans.hasHealthIncreased = false;
    cardToAdjust.booleans.hasHealthReduced = false;
  }

  // remove from stream
  filterArray(healthStream, obj.uuid, idx);
};

export default removeFromHealthStreamAndSetDisplay;
