import { add } from 'mathjs';
import { Card } from '../types';

/**
 * Determines which power to show on a card.
 */
const getCardPower = (obj: Card): number => {
  const initialPower =
    obj?.powerOverride ||
    obj.powerStream[obj.powerStream.length - 1]?.currentPower ||
    obj.basePower;

  if (obj.zonePowerAdjustment) {
    return add(initialPower, obj.zonePowerAdjustment);
  }

  return initialPower;
};

export default getCardPower;
