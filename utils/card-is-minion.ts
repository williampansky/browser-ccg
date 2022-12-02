import { CardType } from '../enums';
import { Card } from '../types';

/**
 * Used to check if the `card.type` is equal to `Minion`
 * @example cardIsMinion(cardToCheck)
 */
export default function cardIsMinion(card: Card): boolean {
  return card.type === CardType.Minion;
}
