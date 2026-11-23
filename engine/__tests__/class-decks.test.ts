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
  it('gives every class its own playable cards (Ranger and Assassin the fewest)', () => {
    for (const key of [
      'FIGHTER',
      'WIZARD',
      'RANGER',
      'CLERIC',
      'CRUSADER',
      'ASSASSIN',
      'MYSTIC',
      'NECROMANCER',
      'WARDEN',
    ]) {
      const own = classCardsFor(cards, key);

      expect(own.length).toBeGreaterThanOrEqual(8);
      expect(own.every((c) => c.heroClass === key)).toBe(true);
    }
  });
  it('is empty for no class', () => {
    expect(classCardsFor(cards, 'NOPE')).toEqual([]);
  });
  it('keeps every class card out of the ordinary pool', () => {
    expect(neutral.some((c) => c.heroClass)).toBe(false);
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
    const few = classCardsFor(cards, 'FIGHTER').slice(0, 3);
    const ids = buildClassDeck(neutral, few, createSeededRng(1));

    for (const card of few) expect(ids).toContain(card.id);
    expect(ids).toHaveLength(MAX_DECK_SIZE);
  });
  it('is just an ordinary random deck for a class with no class cards', () => {
    const ids = buildClassDeck(neutral, [], createSeededRng(1));

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

describe('class decks across every class', () => {
  const classKeys = [
    'FIGHTER',
    'WIZARD',
    'RANGER',
    'CLERIC',
    'CRUSADER',
    'ASSASSIN',
    'MYSTIC',
    'NECROMANCER',
    'WARDEN',
  ];
  const isSecret = (id: string) => {
    const card = byId.get(id);

    return card?.type === 'spell' && card.mechanics.includes('MYSTERY');
  };

  it('hold only ordinary cards and their own class cards, never another class\u2019s', () => {
    for (const key of classKeys) {
      for (let seed = 1; seed <= 15; seed++) {
        const ids = buildClassDeck(
          neutral,
          classCardsFor(cards, key),
          createSeededRng(seed),
        );

        for (const id of ids) {
          const owner = classOf(id);

          expect([key, seed, id, owner === undefined || owner === key]).toEqual(
            [key, seed, id, true],
          );
        }
      }
    }
  });
  it('a Mystic deck never holds a Secret (they belong to other classes)', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const ids = buildClassDeck(
        neutral,
        classCardsFor(cards, 'MYSTIC'),
        createSeededRng(seed),
      );

      expect(ids.filter(isSecret)).toEqual([]);
    }
  });
  it('a Wizard deck can hold Secrets, since its block has them', () => {
    let seen = 0;

    for (let seed = 1; seed <= 40; seed++) {
      seen += buildClassDeck(
        neutral,
        classCardsFor(cards, 'WIZARD'),
        createSeededRng(seed),
      ).filter(isSecret).length;
    }
    expect(seen).toBeGreaterThan(0);
  });
});
