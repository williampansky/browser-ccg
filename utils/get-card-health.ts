import { add } from 'mathjs';
import { Card } from '../types';

/**
 * Determines which health to show on a card.
 */
const getCardHealth = (obj: Card): number => {
  let initialHealth: number = obj.baseHealth;

  if (obj?.healthOverride) {
    initialHealth = obj?.healthOverride;
  }

  if (obj.healthStream.length !== 0) {
    initialHealth = obj.healthStream[obj.healthStream.length - 1].currentHealth;
  }

  if (obj.zonePowerAdjustment) {
    return add(initialHealth, obj.zonePowerAdjustment);
  }

  return initialHealth;
};

export default getCardHealth;
