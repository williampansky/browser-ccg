import {
  buildClassDeck,
  buildDeck,
  Card,
  checkDeck,
  MAX_DECK_SIZE,
  Rng,
} from '../../engine';
import { starterDeck } from '../../engine/starter-decks';
import type { SavedDeck } from '../deck-builder/deck-model';

/** `'random-all'`, `'random'` or `'saved:<id>'`. */
export type DeckChoice = string;
/**
 * A random deck from CORE only, plus any CORE cards of the hero's class (PRIME
 * is opt-in).
 */
export const RANDOM_DECK: DeckChoice = 'random';
/**
 * A random deck from CORE and PRIME together, with a third of it the hero's own
 * class cards.
 */
export const RANDOM_ALL: DeckChoice = 'random-all';

/** The hero's own starter deck from `starter-decks.ts`. */
export const STARTER_DECK: DeckChoice = 'starter';

const SAVED_PREFIX = 'saved:';

/** The AI seat always plays its hero's starter deck, whatever was picked. */
export const aiDeckChoice = (): DeckChoice => STARTER_DECK;

export interface DeckOption {
  value: DeckChoice;
  label: string;
  /** One line about what the deck does */
  plan?: string;
}

/**
 * Every deck a player can start a game with: the two random decks, then the
 * player's saved decks.
 */
export const deckOptions = (saved: SavedDeck[]): DeckOption[] => [
  {
    value: STARTER_DECK,
    label: 'Starter deck',
    plan: `${MAX_DECK_SIZE} cards chosen for your hero's class`,
  },
  {
    value: RANDOM_ALL,
    label: 'Random deck (Core + Prime)',
    plan: `${MAX_DECK_SIZE} random cards, a third of them your hero's class cards`,
  },
  {
    value: RANDOM_DECK,
    label: 'Random deck (Core only)',
    plan: `${MAX_DECK_SIZE} random CORE cards`,
  },
  ...saved
    .filter((d) => d.cards.length > 0)
    .map((d) => ({
      value: `${SAVED_PREFIX}${d.id}`,
      label: `${d.name || 'Unnamed'} (yours, ${d.cards.length} cards)`,
    })),
];

/** The hero a saved-deck choice brings along, if it has one. */
export const savedDeckHero = (
  choice: DeckChoice,
  saved: SavedDeck[],
): string | undefined => {
  if (!choice.startsWith(SAVED_PREFIX)) return undefined;

  const deck = saved.find((d) => `${SAVED_PREFIX}${d.id}` === choice);

  return deck && deck.cards.length > 0 ? deck.hero : undefined;
};

/**
 * The card ids for a choice. A choice that no longer exists (a deleted saved
 * deck, an old removed one) falls back to a random Core + Prime deck.
 */
export const resolveDeck = (
  choice: DeckChoice,
  pool: Card[],
  saved: SavedDeck[],
  rng: Rng,
  /** The opt-in PRIME cards */
  prime: Card[] = [],
  /** The hero's class cards (none for no hero or a class without any) */
  classCards: Card[] = [],
  /** The hero's class key, for the starter deck */
  hero?: string,
): { name: string; cards: string[]; hero?: string } => {
  const starter = hero ? starterDeck(hero) : [];

  if (choice === STARTER_DECK && starter.length > 0)
    return { name: 'the starter deck', cards: starter };

  if (choice === RANDOM_DECK) {
    const ownCore = classCards.filter((c) => c.source === 'core');

    return {
      name: 'a random Core deck',
      cards: buildClassDeck(pool, ownCore, rng),
    };
  }

  if (choice.startsWith(SAVED_PREFIX)) {
    const deck = saved.find((d) => `${SAVED_PREFIX}${d.id}` === choice);

    if (deck && deck.cards.length > 0)
      return { name: deck.name, cards: deck.cards, hero: deck.hero };
  }

  if (starter.length > 0) return { name: 'the starter deck', cards: starter };

  return {
    name: 'a random Core + Prime deck',
    cards: buildClassDeck([...pool, ...prime], classCards, rng),
  };
};

/**
 * True if a deck fits the rules (30 cards at most); saved decks are cleaned on
 * load, so this guards the rest.
 */
export const deckIsLegal = (
  cards: string[],
  byId: ReadonlyMap<string, Card>,
  hero?: string,
): boolean => checkDeck(cards, byId, true, hero).ok;

const KEY = 'ccg.newGame.v1';

/** A stored choice that still exists; an old one (a removed deck) is reset. */
const validChoice = (value: unknown): DeckChoice =>
  value === RANDOM_DECK ||
  value === RANDOM_ALL ||
  value === STARTER_DECK ||
  (typeof value === 'string' && value.startsWith(SAVED_PREFIX))
    ? value
    : STARTER_DECK;

/** The decks picked last time for Player 1 and Player 2. */
export const loadChoices = (): Record<'0' | '1', DeckChoice> => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');

    return { '0': validChoice(raw['0']), '1': validChoice(raw['1']) };
  } catch {
    return { '0': STARTER_DECK, '1': STARTER_DECK };
  }
};
export const saveChoices = (choices: Record<'0' | '1', DeckChoice>): void => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(choices));
  } catch {
    /* not saved */
  }
};
