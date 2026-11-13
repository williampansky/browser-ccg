import { Card, MAX_DECK_SIZE, maxCopies } from '../../engine';

/** A deck the player saved: a name and the card ids (a card with two copies appears twice), sorted by cost then name. */
export interface SavedDeck {
  id: string;
  name: string;
  cards: string[];
  /** A hero key such as `ZEUS`. Unset means the deck does not choose: the New game picker's hero is used. */
  hero?: string;
}

export const countOf = (deck: SavedDeck, id: string): number => deck.cards.filter((c) => c === id).length;

const sorted = (ids: string[], byId: ReadonlyMap<string, Card>): string[] =>
  [...ids].sort((a, b) => {
    const x = byId.get(a);
    const y = byId.get(b);
    return (x?.cost ?? 0) - (y?.cost ?? 0) || (x?.name ?? a).localeCompare(y?.name ?? b) || a.localeCompare(b);
  });

/** Why a card cannot be added right now, or `undefined` if it can. */
export const whyNotAdd = (deck: SavedDeck, card: Card): string | undefined => {
  if (deck.cards.length >= MAX_DECK_SIZE) return `The deck is full (${MAX_DECK_SIZE} cards).`;
  if (countOf(deck, card.id) >= maxCopies(card)) {
    return maxCopies(card) === 1 ? 'Only one copy of a mythic card.' : `At most ${maxCopies(card)} copies of a card.`;
  }
  return undefined;
};

export const addCard = (deck: SavedDeck, card: Card, byId: ReadonlyMap<string, Card>): SavedDeck =>
  whyNotAdd(deck, card) ? deck : { ...deck, cards: sorted([...deck.cards, card.id], byId) };

/** Removes one copy. */
export const removeCard = (deck: SavedDeck, id: string): SavedDeck => {
  const at = deck.cards.indexOf(id);
  return at < 0 ? deck : { ...deck, cards: deck.cards.filter((_, i) => i !== at) };
};

/** Keeps only cards that exist, within the copy and size limits (saved decks may predate a data change). */
export const cleanDeck = (deck: SavedDeck, byId: ReadonlyMap<string, Card>): SavedDeck => {
  let out: SavedDeck = { ...deck, cards: [] };
  deck.cards.forEach((id) => {
    const card = byId.get(id);
    if (card) out = addCard(out, card, byId);
  });
  return out;
};

export const newDeckId = (): string => `deck-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

export const blankDeck = (name = 'New deck'): SavedDeck => ({ id: newDeckId(), name, cards: [] });

/** Mana curve: how many cards cost 0, 1, ... 6, 7+ (eight buckets). */
export const curve = (deck: SavedDeck, byId: ReadonlyMap<string, Card>): number[] => {
  const out = Array(8).fill(0);
  deck.cards.forEach((id) => {
    const c = byId.get(id);
    if (c) out[Math.min(c.cost, 7)] += 1;
  });
  return out;
};
