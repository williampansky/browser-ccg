import { Card, GameState } from '../types';
import getCardHealth from './get-card-health';

/**
 * Pushes to a card's healthStream and
 * sets the card's displayHealth.
 */
const pushHealthStreamAndSetDisplay = (
  cardToAdjust: Card,
  cardToBlame: Card,
  adjustment: number,
  currentHealth: number,
): void => {
  cardToAdjust.healthStream.push({
    blame: cardToBlame.name,
    adjustment,
    currentHealth,
    uuid: cardToBlame.uuid,
  });
  
  cardToAdjust.displayHealth = getCardHealth(cardToAdjust);
};

export default pushHealthStreamAndSetDisplay;
