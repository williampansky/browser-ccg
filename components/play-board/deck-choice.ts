import { buildDeck, Card, checkDeck, MAX_DECK_SIZE, Rng } from '../../engine';
import { buildStarterDeck, STARTER_DECKS } from '../../engine/starter-decks';
import type { SavedDeck } from '../deck-builder/deck-model';

/** `'random'`, `'starter:<name>'` or `'saved:<id>'`. */
export type DeckChoice = string;
export const RANDOM_DECK: DeckChoice = 'random';
/** A starter deck picked at random each game. */
export const RANDOM_STARTER: DeckChoice = 'starter-random';

/** Mostly a starter deck, sometimes (`SURPRISE_RANDOM_ODDS`) a fully random one. The AI seat's default. */
export const SURPRISE: DeckChoice = 'surprise';
/** The chance, as 1 in N, that `SURPRISE` picks a random deck instead of a starter deck. */
export const SURPRISE_RANDOM_ODDS = 10;

/** The choice the AI seat actually uses: a starter deck or random choice as picked, anything else (a saved deck) becomes `SURPRISE`. */
export const aiDeckChoice = (choice: DeckChoice): DeckChoice =>
  choice === RANDOM_DECK || choice === RANDOM_STARTER || choice === SURPRISE || STARTER_DECKS.some((d) => `starter:${d.name}` === choice)
    ? choice
    : SURPRISE;

export interface DeckOption {
  value: DeckChoice;
  label: string;
  /** One line about what the deck does */
  plan?: string;
}

/** Every deck a player can start a game with: random, the starter decks, then the player's saved decks. */
export const deckOptions = (saved: SavedDeck[]): DeckOption[] => [
  { value: SURPRISE, label: 'Surprise', plan: 'usually a starter deck, about 1 time in 10 a random deck' },
  { value: RANDOM_STARTER, label: 'Random starter deck', plan: 'one of the starter decks, picked at random' },
  { value: RANDOM_DECK, label: 'Random deck', plan: `${MAX_DECK_SIZE} random cards` },
  ...STARTER_DECKS.map((d) => ({ value: `starter:${d.name}`, label: d.name, plan: d.plan })),
  ...saved
    .filter((d) => d.cards.length > 0)
    .map((d) => ({ value: `saved:${d.id}`, label: `${d.name || 'Unnamed'} (yours, ${d.cards.length} cards)` })),
];

/** The card ids for a choice. A choice that no longer exists (a deleted saved deck) falls back to a random deck. */
export const resolveDeck = (choice: DeckChoice, pool: Card[], saved: SavedDeck[], rng: Rng): { name: string; cards: string[] } => {
  if (choice === SURPRISE && rng.int(SURPRISE_RANDOM_ODDS) === 0) return { name: 'a random deck', cards: buildDeck(pool, rng) };
  if ((choice === RANDOM_STARTER || choice === SURPRISE) && STARTER_DECKS.length > 0) {
    const starter = STARTER_DECKS[rng.int(STARTER_DECKS.length)];
    return { name: starter.name, cards: buildStarterDeck(starter, pool) };
  }
  if (choice.startsWith('starter:')) {
    const starter = STARTER_DECKS.find((d) => `starter:${d.name}` === choice);
    if (starter) return { name: starter.name, cards: buildStarterDeck(starter, pool) };
  }
  if (choice.startsWith('saved:')) {
    const deck = saved.find((d) => `saved:${d.id}` === choice);
    if (deck && deck.cards.length > 0) return { name: deck.name, cards: deck.cards };
  }
  return { name: 'a random deck', cards: buildDeck(pool, rng) };
};

/** True if a deck fits the rules (30 cards at most); saved decks are cleaned on load, so this guards the rest. */
export const deckIsLegal = (cards: string[], byId: ReadonlyMap<string, Card>): boolean => checkDeck(cards, byId).ok;

const KEY = 'ccg.newGame.v1';

/** The decks picked last time for Player 1 and Player 2. */
export const loadChoices = (): Record<'0' | '1', DeckChoice> => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    return { '0': typeof raw['0'] === 'string' ? raw['0'] : RANDOM_DECK, '1': typeof raw['1'] === 'string' ? raw['1'] : SURPRISE };
  } catch {
    return { '0': RANDOM_DECK, '1': SURPRISE };
  }
};
export const saveChoices = (choices: Record<'0' | '1', DeckChoice>): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(choices));
  } catch {
    /* not saved */
  }
};
