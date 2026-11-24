import { MAX_DECK_SIZE } from './deck-rules';
import type { Card } from './cards/types';
import { getCardDef } from './definitions';
import type { DefLookup } from './definitions/define-card';
import type { Rng } from './rng';

/**
 * Mechanics the engine implements from the card's stats alone. Anything else
 * needs a definition.
 */
const KEYWORD_ONLY = [
  'BULWARK',
  'RUSH',
  'BUBBLE',
  'NO_ATTACK',
  'DOUBLE_ATTACK',
  'HIDDEN',
];

/**
 * The words card text may contain with nothing else behind them: the keywords
 * themselves (and the data's own names for them).
 */
const KEYWORD_WORDS = [
  'guard',
  'stampede',
  'charge',
  'bubble',
  'concealed',
  'onslaught',
  "can't attack",
  'can’t attack',
];

/**
 * True when the card's text says more than its keywords. The data's `mechanics`
 * column is blank on many cards, so a card whose text promises an effect must
 * not be taken for a plain body just because it lists no mechanic.
 */
export const hasEffectText = (card: Card): boolean => {
  const plain = (card.text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/%[A-Z_0-9]+%/g, ' ')
    .toLowerCase();
  const rest = KEYWORD_WORDS.reduce(
    (text, word) => text.split(word).join(' '),
    plain,
  );

  return /[a-z0-9]/.test(rest);
};

/**
 * True if the card does something its stats and keywords don't capture: every
 * spell and item, any minion or weapon with a mechanic other than the pure
 * keywords (On Play effect, aura, spell damage, ...), and any card whose text
 * says more than a keyword.
 * Erring this way means an unfinished card is refused, never silently played as
 * vanilla.
 */
export const needsBehaviour = (card: Card): boolean =>
  card.type === 'spell' ||
  card.type === 'item' ||
  card.mechanics.some((m) => !KEYWORD_ONLY.includes(m)) ||
  hasEffectText(card);

/**
 * The engine can play this card faithfully: it needs no behaviour, or it has a
 * definition.
 */
export const isPlayable = (card: Card, defs: DefLookup = getCardDef): boolean =>
  !needsBehaviour(card) || defs(card) !== undefined;

/**
 * Real, collectible-pool cards (class-restricted cards are left out: random and
 * starter decks have no hero) the engine fully supports right now. Grows as
 * definitions are added.
 */
export const playablePool = (
  cards: Card[],
  defs: DefLookup = getCardDef,
): Card[] =>
  cards.filter(
    (c) =>
      c.source === 'core' &&
      !c.isToken &&
      !c.heroClass &&
      c.active &&
      isPlayable(c, defs),
  );

/**
 * PRIME cards the engine can play right now. Kept apart from `playablePool`
 * (CORE): PRIME is opt-in, so CORE's balance and
 * the starter decks do not change. A card with no name is a placeholder in the
 * data and is left out until it has one.
 */
export const primePool = (
  cards: Card[],
  defs: DefLookup = getCardDef,
): Card[] =>
  cards.filter(
    (c) =>
      c.source === 'prime' &&
      !c.isToken &&
      !c.heroClass &&
      c.active &&
      !!c.name &&
      isPlayable(c, defs),
  );

/**
 * Class-restricted cards (a `heroClass`, e.g. Warrior's Smash!) the engine can
 * play. Kept out of every other pool: only the deck
 * builder and the collection offer them, and the builder only to a deck with
 * that hero.
 */
export const classPool = (
  cards: Card[],
  defs: DefLookup = getCardDef,
): Card[] =>
  cards.filter(
    (c) =>
      (c.source === 'core' || c.source === 'prime') &&
      !!c.heroClass &&
      !c.isToken &&
      c.active &&
      !!c.name &&
      isPlayable(c, defs),
  );

/**
 * A random deck of `size` distinct cards from the pool (cycles if the pool is
 * smaller). Never more than `MAX_DECK_SIZE`.
 */
export const buildDeck = (
  pool: Card[],
  rng: Rng,
  size = MAX_DECK_SIZE,
): string[] => {
  size = Math.min(size, MAX_DECK_SIZE);
  const ids = rng.shuffle(pool.map((c) => c.id));
  return Array.from({ length: size }, (_, i) => ids[i % ids.length]);
};

/** The class cards in a class deck: a third of it, as in a built class deck. */
export const CLASS_CARD_SLOTS = MAX_DECK_SIZE / 3;

/** The class-locked cards of one class (see `classPool`). */
export const classCardsFor = (
  cards: Card[],
  classKey: string,
  defs: DefLookup = getCardDef,
): Card[] => classPool(cards, defs).filter((c) => c.heroClass === classKey);

/**
 * A random deck for a hero: up to `CLASS_CARD_SLOTS` different cards of its
 * class (all of them, when the class has fewer), filled to `size` from the
 * ordinary `pool`. Never more than `MAX_DECK_SIZE`.
 */
export const buildClassDeck = (
  pool: Card[],
  classCards: Card[],
  rng: Rng,
  size = MAX_DECK_SIZE,
): string[] => {
  const total = Math.min(size, MAX_DECK_SIZE);
  const slots = Math.min(CLASS_CARD_SLOTS, classCards.length, total);
  const own = rng.shuffle(classCards.map((c) => c.id)).slice(0, slots);

  return [...own, ...buildDeck(pool, rng, total - slots)];
};
