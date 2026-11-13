import { getHero } from '../../engine/heroes';
import type { Card } from '../../engine';
import { cleanDeck, SavedDeck } from './deck-model';

const DECKS_KEY = 'ccg.decks.v1';

const read = (key: string): string | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null): void => {
  try {
    if (typeof window === 'undefined') return;
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked: the deck just is not saved */
  }
};

/** The saved decks, cleaned against the current card data. Bad or missing storage gives no decks. */
export const loadDecks = (byId: ReadonlyMap<string, Card>): SavedDeck[] => {
  try {
    const raw = JSON.parse(read(DECKS_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((d) => d && typeof d.id === 'string' && Array.isArray(d.cards))
      .map((d) => cleanDeck({ id: d.id, name: String(d.name ?? 'Deck'), cards: d.cards.filter((c: unknown) => typeof c === 'string'), ...(getHero(d.hero) ? { hero: d.hero } : {}) }, byId));
  } catch {
    return [];
  }
};

export const saveDecks = (decks: SavedDeck[]): void => write(DECKS_KEY, JSON.stringify(decks));

