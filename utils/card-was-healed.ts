import { gt, gte } from 'lodash';
import type { Card } from '../types';

const cardWasHealed = (card: Card) => {
  const { healthStream } = card;
  const { length } = healthStream;

  if (gte(length, 2)) {
    return gt(
      healthStream[length - 1]?.currentHealth,
      healthStream[length - 2]?.currentHealth
    );
  }

  return false;
};

export default cardWasHealed;
