import type { Card, CardCatalog } from '../cards/types';
import { needsBehaviour } from '../decks';
import { getCardDef } from '../definitions';
import type { DefLookup } from '../definitions/define-card';

/**
 * The cards "a random card" can be: real CORE and PRIME cards (not tokens, not unnamed placeholders) that the engine can play
 * faithfully. Sorted by id so that, with the same seed, the same card is picked. `where` narrows it (a spell, a race, a cost...).
 * The pool grows by itself as more cards get definitions.
 */
export const cardPool = (catalog: CardCatalog, where: (c: Card) => boolean = () => true, defs: DefLookup = getCardDef): Card[] =>
  Array.from(catalog.values())
    .filter(
      (c) =>
        (c.source === 'core' || c.source === 'prime') &&
        !c.isToken &&
        c.active &&
        !!c.name &&
        (!needsBehaviour(c) || defs(c) !== undefined) &&
        where(c)
    )
    .sort((a, b) => (a.id < b.id ? -1 : 1));
