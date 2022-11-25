import { Card, GameState } from '../types';
import getCardPower from './get-card-power';

/**
 * Pushes to a card's powerStream and
 * sets the card's displayPower.
 */
const pushPowerStreamAndSetDisplay = (
  cardToAdjust: Card,
  cardToBlame: Card,
  adjustment: number,
  currentPower: number,
): void => {
  cardToAdjust.powerStream.push({
    blame: cardToBlame.name,
    adjustment,
    currentPower,
    uuid: cardToBlame.uuid,
  });
  
  cardToAdjust.displayPower = getCardPower(cardToAdjust);
};

export default pushPowerStreamAndSetDisplay;
