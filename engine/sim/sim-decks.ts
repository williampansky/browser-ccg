import type { Card } from '../cards/types';
import { buildDeck, CLASS_CARD_SLOTS } from '../decks';
import { createSeededRng } from '../rng';

/**
 * Seeded random decks for the sim scripts (the game has no premade decks):
 * `count` different decks of 30 cards from `pool`, the same every run.
 */
export const simDecks = (
  pool: Card[],
  count: number,
  seed = 1,
): { name: string; deck: string[] }[] =>
  Array.from({ length: count }, (_, index) => ({
    name: `Deck ${index + 1}`,
    deck: buildDeck(pool, createSeededRng(seed + index)),
  }));

/**
 * A sim deck for a hero: up to `CLASS_CARD_SLOTS` of its class cards swapped
 * in for the front of `base`, so two heroes on the same base deck share the
 * rest and differ by their class cards.
 */
export const classDeck = (
  base: string[],
  classCards: Card[],
  seed: number,
): string[] => {
  const slots = Math.min(CLASS_CARD_SLOTS, classCards.length);
  const own = createSeededRng(seed)
    .shuffle(classCards.map((c) => c.id))
    .slice(0, slots);

  return [...own, ...base.slice(0, base.length - slots)];
};
