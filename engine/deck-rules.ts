import type { Card } from './cards/types';

/** A deck holds at most this many cards. Applies to every deck: built by hand, a starter deck or a random one. */
export const MAX_DECK_SIZE = 30;

/** How many copies of one card a deck may hold: one for a MYTHIC card, otherwise two. */
export const maxCopies = (card: Pick<Card, 'rarity'>): number => (card.rarity === 'MYTHIC' ? 1 : 2);

export interface DeckCheck {
  ok: boolean;
  errors: string[];
}

/**
 * Checks a deck list (card ids) against the deck rules: at most `MAX_DECK_SIZE` cards, and the copy limit.
 * A deck with fewer cards is allowed (it just runs out sooner, so the player takes fatigue).
 * `copyLimit` is off for the engine's own check; the deck builder turns it on.
 */
export const checkDeck = (ids: string[], byId: ReadonlyMap<string, Card>, copyLimit = true): DeckCheck => {
  const errors: string[] = [];
  if (ids.length > MAX_DECK_SIZE) errors.push(`A deck holds at most ${MAX_DECK_SIZE} cards (this one has ${ids.length}).`);
  const counts = new Map<string, number>();
  ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  counts.forEach((n, id) => {
    const card = byId.get(id);
    if (!card) errors.push(`Unknown card ${id}.`);
    else if (copyLimit && n > maxCopies(card)) errors.push(`${card.name ?? id}: at most ${maxCopies(card)} copies (this deck has ${n}).`);
  });
  return { ok: errors.length === 0, errors };
};
