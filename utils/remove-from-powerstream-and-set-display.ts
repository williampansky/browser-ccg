import { gt, gte, lt } from 'lodash';
import { subtract } from 'mathjs';
import type { Card } from '../types';
import filterArray from './filter-array';
import getCardPower from './get-card-power';

/**
 * Removes an entry to a card's powerStream
 * and sets the card's displayPower.
 */
const removeFromPowerStreamAndSetDisplay = (
  cardToAdjust: Card,
  cardToBlame: Card
): void => {
  const { powerStream } = cardToAdjust;

  // push to stream
  const obj = powerStream.find((s) => s.uuid === cardToBlame.uuid)!;
  const idx = powerStream.findIndex((s) => s.uuid === cardToBlame.uuid);
  
  if (gte(powerStream.length, 2)) {
    const lastObj = powerStream[powerStream.length - 1];
    const adjustment = subtract(lastObj.currentPower, obj.adjustment)
    cardToAdjust.displayPower = adjustment;
  } else {
    cardToAdjust.displayPower = cardToAdjust.basePower;
    cardToAdjust.booleans.hasPowerIncreased = false;
    cardToAdjust.booleans.hasPowerReduced = false;
  }

  filterArray(powerStream, obj.uuid, idx);
};

export default removeFromPowerStreamAndSetDisplay;
