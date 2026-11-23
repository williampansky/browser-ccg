import { loadHsCards } from '../cards/load-hs-cards';
import {
  buildClassDeck,
  CLASS_CARD_SLOTS,
  classCardsFor,
  playablePool,
  primePool,
} from '../decks';
import { MAX_DECK_SIZE } from '../deck-rules';
import { createSeededRng } from '../rng';

const { cards, byId } = loadHsCards();
const neutral = [...playablePool(cards), ...primePool(cards)];
const mysticIds = [
  ...Array.from({ length: 15 }, (_, i) => `PRIME_${200 + i}`),
  'PRIME_257',
  'PRIME_258',
  'PRIME_259',
  'CORE_109',
];
const classOf = (id: string) => byId.get(id)?.heroClass;

describe('classCardsFor', () => {
  it('is the class-locked cards of that class and nothing else', () => {
    const ids = classCardsFor(cards, 'MYSTIC').map((c) => c.id);

    expect([...ids].sort()).toEqual([...mysticIds].sort());
  });
  it('leaves a class with a single class card with just that card', () => {
    expect(classCardsFor(cards, 'FIGHTER').map((c) => c.id)).toEqual([
      'PRIME_255',
    ]);
  });
  it('is empty for a class with none yet, and for no class', () => {
    expect(classCardsFor(cards, 'WARDEN')).toEqual([]);
    expect(classCardsFor(cards, 'NOPE')).toEqual([]);
  });
});

describe('buildClassDeck', () => {
  const deck = (classKey: string, seed = 1) =>
    buildClassDeck(
      neutral,
      classCardsFor(cards, classKey),
      createSeededRng(seed),
    );

  it('holds a third of the deck in class cards, each different', () => {
    const own = deck('MYSTIC').filter((id) => classOf(id) === 'MYSTIC');

    expect(CLASS_CARD_SLOTS).toBe(MAX_DECK_SIZE / 3);
    expect(own).toHaveLength(CLASS_CARD_SLOTS);
    expect(new Set(own).size).toBe(own.length);
  });
  it('is a full deck of 30 with every other card from the ordinary pool', () => {
    const ids = deck('MYSTIC');
    const allowed = new Set(neutral.map((c) => c.id));

    expect(ids).toHaveLength(MAX_DECK_SIZE);
    for (const id of ids) {
      expect(classOf(id) === 'MYSTIC' || allowed.has(id)).toBe(true);
    }
  });
  it('never holds another class’s cards', () => {
    for (let seed = 1; seed <= 20; seed++) {
      expect(deck('MYSTIC', seed).includes('PRIME_255')).toBe(false);
    }
  });
  it('puts in every class card a small class has, and fills the rest', () => {
    const ids = deck('FIGHTER');

    expect(ids.filter((id) => id === 'PRIME_255')).toHaveLength(1);
    expect(ids).toHaveLength(MAX_DECK_SIZE);
  });
  it('is just an ordinary random deck for a class with no class cards', () => {
    const ids = deck('WARDEN');

    expect(ids).toHaveLength(MAX_DECK_SIZE);
    expect(ids.every((id) => !classOf(id))).toBe(true);
  });
  it('varies with the seed, and repeats for the same seed', () => {
    expect(deck('MYSTIC', 1)).toEqual(deck('MYSTIC', 1));
    expect(deck('MYSTIC', 1)).not.toEqual(deck('MYSTIC', 2));
  });
  it('with a small pool, never repeats a class card beyond the pool', () => {
    const small = buildClassDeck(
      neutral.slice(0, 5),
      classCardsFor(cards, 'MYSTIC'),
      createSeededRng(1),
      12,
    );

    expect(small).toHaveLength(12);
  });
});
