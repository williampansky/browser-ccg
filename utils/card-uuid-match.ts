import { Card } from '../types';

/**
 * Used to determine if the `card1` param is the same as the `card2` param
 * by checking each against the `card.uuid` key value.
 * @example cardUuidMatch(cardInLoop, cardThatWasTargeted)
 */
export default function cardUuidMatch(card1: Card, card2: Card): boolean {
  return card1.uuid === card2.uuid;
}
