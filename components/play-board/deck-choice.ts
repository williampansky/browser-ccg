import { buildDeck, Card, checkDeck, MAX_DECK_SIZE, Rng } from '../../engine';
import { ALL_STARTER_DECKS, buildStarterDeck, MIXED_STARTER_DECKS, poolFor, PRIME_STARTER_DECKS, STARTER_DECKS } from '../../engine/starter-decks';
import type { SavedDeck } from '../deck-builder/deck-model';

/** `'random'`, `'starter:<name>'` or `'saved:<id>'`. */
export type DeckChoice = string;
export const RANDOM_DECK: DeckChoice = 'random';
/** A random deck from CORE and PRIME together (PRIME is opt-in; every other choice here uses CORE only). */
export const RANDOM_ALL: DeckChoice = 'random-all';
/** A (CORE) starter deck picked at random each game. */
export const RANDOM_STARTER: DeckChoice = 'starter-random';
/** A PRIME starter deck picked at random each game (PRIME is opt-in, so this is its own choice). */
export const RANDOM_STARTER_PRIME: DeckChoice = 'starter-random-prime';
/** A Core + Prime starter deck picked at random each game. */
export const RANDOM_STARTER_BOTH: DeckChoice = 'starter-random-both';

/** Mostly a starter deck, sometimes (`SURPRISE_RANDOM_ODDS`) a fully random one. The AI seat's default. */
export const SURPRISE: DeckChoice = 'surprise';
/** The chance, as 1 in N, that `SURPRISE` picks a random deck instead of a starter deck. */
export const SURPRISE_RANDOM_ODDS = 10;

/** The choice the AI seat actually uses: a starter deck or random choice as picked, anything else (a saved deck) becomes `SURPRISE`. */
export const aiDeckChoice = (choice: DeckChoice): DeckChoice =>
  choice === RANDOM_DECK ||
  choice === RANDOM_ALL ||
  choice === RANDOM_STARTER ||
  choice === RANDOM_STARTER_PRIME ||
  choice === RANDOM_STARTER_BOTH ||
  choice === SURPRISE ||
  ALL_STARTER_DECKS.some((d) => `starter:${d.name}` === choice)
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
  { value: RANDOM_STARTER, label: 'Random starter deck', plan: 'one of the Core starter decks, picked at random' },
  { value: RANDOM_STARTER_PRIME, label: 'Random Prime starter deck', plan: 'one of the Prime starter decks, picked at random' },
  { value: RANDOM_STARTER_BOTH, label: 'Random Core + Prime starter deck', plan: 'one of the mixed starter decks, picked at random' },
  { value: RANDOM_DECK, label: 'Random deck', plan: `${MAX_DECK_SIZE} random CORE cards` },
  { value: RANDOM_ALL, label: 'Random deck (Core + Prime)', plan: `${MAX_DECK_SIZE} random cards, PRIME included` },
  ...STARTER_DECKS.map((d) => ({ value: `starter:${d.name}`, label: d.name, plan: d.plan })),
  ...PRIME_STARTER_DECKS.map((d) => ({ value: `starter:${d.name}`, label: `${d.name} (Prime)`, plan: d.plan })),
  ...MIXED_STARTER_DECKS.map((d) => ({ value: `starter:${d.name}`, label: `${d.name} (Core + Prime)`, plan: d.plan })),
  ...saved
    .filter((d) => d.cards.length > 0)
    .map((d) => ({ value: `saved:${d.id}`, label: `${d.name || 'Unnamed'} (yours, ${d.cards.length} cards)` })),
];

/** The card ids for a choice. A choice that no longer exists (a deleted saved deck) falls back to a random deck. */
export const resolveDeck = (
  choice: DeckChoice,
  pool: Card[],
  saved: SavedDeck[],
  rng: Rng,
  /** The opt-in PRIME cards, for `RANDOM_ALL` */
  prime: Card[] = [],
): { name: string; cards: string[]; hero?: string } => {
  if (choice === RANDOM_ALL) return { name: 'a random Core + Prime deck', cards: buildDeck([...pool, ...prime], rng) };
  if (choice === SURPRISE && rng.int(SURPRISE_RANDOM_ODDS) === 0) return { name: 'a random deck', cards: buildDeck(pool, rng) };
  if ((choice === RANDOM_STARTER || choice === SURPRISE) && STARTER_DECKS.length > 0) {
    const starter = STARTER_DECKS[rng.int(STARTER_DECKS.length)];
    return { name: starter.name, cards: buildStarterDeck(starter, pool) };
  }
  if (choice === RANDOM_STARTER_PRIME || choice === RANDOM_STARTER_BOTH) {
    const decks = choice === RANDOM_STARTER_PRIME ? PRIME_STARTER_DECKS : MIXED_STARTER_DECKS;
    const starter = decks[rng.int(decks.length)];
    return { name: starter.name, cards: buildStarterDeck(starter, poolFor(starter.set, pool, prime)) };
  }
  if (choice.startsWith('starter:')) {
    const starter = ALL_STARTER_DECKS.find((d) => `starter:${d.name}` === choice);
    if (starter) return { name: starter.name, cards: buildStarterDeck(starter, poolFor(starter.set, pool, prime)) };
  }
  if (choice.startsWith('saved:')) {
    const deck = saved.find((d) => `saved:${d.id}` === choice);
    if (deck && deck.cards.length > 0) return { name: deck.name, cards: deck.cards, hero: deck.hero };
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
