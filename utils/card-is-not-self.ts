import { Card } from '../types';

/**
 * Used to determine if the `card1` and `card2` params are not the
 * same instance using a `uuid` check.
 *
 * ```ts
 * const { incomingCard } = props;
 * G.zones.forEach(z => {
 *  z.sides[playerId].forEach(cardSlot => {
 *    if (cardIsNotSelf(cardSlot, incomingCard)) {
 *      // ... some code executed here
 *    }
 *  })
 * })
 *
 * ```
 *
 * @example cardIsNotSelf(cardInLoop, cardThatWasPlayed)
 */
export default function cardIsNotSelf(card1: Card, card2: Card): boolean {
  return card1.uuid !== card2.uuid;
}
