import { add } from 'mathjs';
import { Card } from '../types';

/**
 * Determines which power to show on a card.
 */
const getCardPower = (obj: Card): number => {
  let initialPower: number = obj.basePower;

  if (obj?.powerOverride) {
    initialPower = obj?.powerOverride;
  }

  if (obj.powerStream.length !== 0) {
    initialPower = obj.powerStream[obj.powerStream.length - 1].currentPower;
  }

  if (obj.zonePowerAdjustment) {
    return add(initialPower, obj.zonePowerAdjustment);
  }

  return initialPower;
};

export default getCardPower;
