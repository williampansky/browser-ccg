import { MAX_DECK_SIZE } from './deck-rules';
import type { Card } from './cards/types';
import { getCardDef } from './definitions';
import type { DefLookup } from './definitions/define-card';
import type { Rng } from './rng';

/** Mechanics the engine implements from the card's stats alone. Anything else needs a definition. */
const KEYWORD_ONLY = ['BULWARK', 'RUSH', 'BUBBLE', 'NO_ATTACK', 'DOUBLE_ATTACK', 'HIDDEN'];

/**
 * True if the card does something its stats and keywords don't capture: every spell and item, and any
 * minion or weapon with a mechanic other than the pure keywords (warcry, aura, spell damage, ...).
 * Erring this way means an unfinished card is refused, never silently played as vanilla.
 */
export const needsBehaviour = (card: Card): boolean =>
  card.type === 'spell' || card.type === 'item' || card.mechanics.some((m) => !KEYWORD_ONLY.includes(m));

/** The engine can play this card faithfully: it needs no behaviour, or it has a definition. */
export const isPlayable = (card: Card, defs: DefLookup = getCardDef): boolean =>
  !needsBehaviour(card) || defs(card) !== undefined;

/** Real, collectible-pool cards the engine fully supports right now. Grows as definitions are added. */
export const playablePool = (cards: Card[], defs: DefLookup = getCardDef): Card[] =>
  cards.filter((c) => c.source === 'core' && !c.isToken && c.active && isPlayable(c, defs));

/** A random deck of `size` distinct cards from the pool (cycles if the pool is smaller). Never more than `MAX_DECK_SIZE`. */
export const buildDeck = (pool: Card[], rng: Rng, size = MAX_DECK_SIZE): string[] => {
  size = Math.min(size, MAX_DECK_SIZE);
  const ids = rng.shuffle(pool.map((c) => c.id));
  return Array.from({ length: size }, (_, i) => ids[i % ids.length]);
};
