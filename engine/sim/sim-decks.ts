import type { Card } from '../cards/types';
import { buildDeck } from '../decks';
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
