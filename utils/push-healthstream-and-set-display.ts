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
  // set boolean tag
  if (cardToAdjust.displayHealth < currentHealth) {
    cardToAdjust.booleans.hasHealthIncreased = true;
    cardToAdjust.booleans.hasHealthReduced = false;
  } else if (cardToAdjust.displayHealth > currentHealth) {
    cardToAdjust.booleans.hasHealthIncreased = false;
    cardToAdjust.booleans.hasHealthReduced = true;
  } else {
    cardToAdjust.booleans.hasHealthIncreased = false;
    cardToAdjust.booleans.hasHealthReduced = false;
  }

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
