import {
  aiDeckChoice,
  deckOptions,
  loadChoices,
  RANDOM_ALL,
  RANDOM_DECK,
  resolveDeck,
  savedDeckHero,
} from '../deck-choice';
import {
  classCardsFor,
  createSeededRng,
  loadHsCards,
  MAX_DECK_SIZE,
  playablePool,
  primePool,
} from '../../../engine';

const { cards } = loadHsCards();
const pool = playablePool(cards);
const prime = primePool(cards);
const isPrime = (id: string) => prime.some((c) => c.id === id);
const mystic = classCardsFor(cards, 'MYSTIC');
const saved = [
  { id: 'a', name: 'Mine', cards: ['CORE_001', 'CORE_001'], hero: 'WIZARD' },
  { id: 'b', name: 'Empty', cards: [] },
  { id: 'c', name: 'Plain', cards: ['CORE_001'] },
];

describe('deck choice', () => {
  it('lists the two random decks, then the saved decks that have cards', () => {
    expect(deckOptions(saved).map((o) => o.value)).toEqual([
      RANDOM_ALL,
      RANDOM_DECK,
      'saved:a',
      'saved:c',
    ]);
  });
  it('has no premade decks left to choose', () => {
    const values = deckOptions(saved).map((o) => o.value);

    expect(values.some((v) => v.startsWith('starter'))).toBe(false);
    expect(values).not.toContain('surprise');
  });
  it('resolves a saved deck as is, with its hero', () => {
    const r = resolveDeck('saved:a', pool, saved, createSeededRng(1));

    expect(r.cards).toEqual(['CORE_001', 'CORE_001']);
    expect(r.hero).toBe('WIZARD');
    expect(resolveDeck('saved:c', pool, saved, createSeededRng(1)).hero).toBe(
      undefined,
    );
  });
  it('falls back to a full random deck for a missing, empty or removed choice', () => {
    for (const choice of [
      'saved:gone',
      'saved:b',
      'starter:Aggro',
      'surprise',
      'garbage',
    ]) {
      const r = resolveDeck(choice, pool, saved, createSeededRng(1), prime);

      expect([choice, r.cards.length]).toEqual([choice, MAX_DECK_SIZE]);
    }
  });
});

describe('the random decks and PRIME', () => {
  it('only the Core + Prime deck can deal PRIME cards', () => {
    let sawPrime = false;

    for (let seed = 1; seed <= 40; seed++) {
      const all = resolveDeck(
        RANDOM_ALL,
        pool,
        [],
        createSeededRng(seed),
        prime,
      );
      const core = resolveDeck(
        RANDOM_DECK,
        pool,
        [],
        createSeededRng(seed),
        prime,
      );

      expect(all.cards).toHaveLength(MAX_DECK_SIZE);
      expect(core.cards).toHaveLength(MAX_DECK_SIZE);
      if (all.cards.some(isPrime)) sawPrime = true;
      expect(core.cards.some(isPrime)).toBe(false);
    }
    expect(sawPrime).toBe(true);
  });
});

describe('class cards in a random deck', () => {
  it('a Core + Prime deck for a Mystic holds ten Mystic cards', () => {
    const ids = resolveDeck(
      RANDOM_ALL,
      pool,
      [],
      createSeededRng(1),
      prime,
      mystic,
    ).cards;
    const own = new Set(mystic.map((c) => c.id));

    expect(ids.filter((id) => own.has(id))).toHaveLength(10);
  });
  it('a deck with no hero or a class without cards holds no class cards', () => {
    const ids = resolveDeck(
      RANDOM_ALL,
      pool,
      [],
      createSeededRng(1),
      prime,
    ).cards;
    const own = new Set(mystic.map((c) => c.id));

    expect(ids.some((id) => own.has(id))).toBe(false);
  });
  it('the Core-only deck leaves out PRIME class cards, so it stays Core only', () => {
    const ids = resolveDeck(
      RANDOM_DECK,
      pool,
      [],
      createSeededRng(1),
      prime,
      mystic,
    ).cards;

    expect(ids.some((id) => id.startsWith('PRIME'))).toBe(false);
  });
});

describe('the AI seat', () => {
  it('keeps a random-deck choice, and a saved deck becomes Core + Prime', () => {
    expect(aiDeckChoice(RANDOM_DECK)).toBe(RANDOM_DECK);
    expect(aiDeckChoice(RANDOM_ALL)).toBe(RANDOM_ALL);
    expect(aiDeckChoice('saved:a')).toBe(RANDOM_ALL);
    expect(aiDeckChoice('starter:Aggro')).toBe(RANDOM_ALL);
  });
});

describe('a saved deck with a hero', () => {
  it('hands its hero back; a plain, empty, missing or random choice gives none', () => {
    expect(savedDeckHero('saved:a', saved)).toBe('WIZARD');
    expect(savedDeckHero('saved:c', saved)).toBeUndefined();
    expect(savedDeckHero('saved:b', saved)).toBeUndefined();
    expect(savedDeckHero('saved:gone', saved)).toBeUndefined();
    expect(savedDeckHero(RANDOM_ALL, saved)).toBeUndefined();
  });
});

describe('remembered choices', () => {
  afterEach(() => window.localStorage.clear());

  it('resets an old removed choice (a premade deck, Surprise) to Core + Prime', () => {
    window.localStorage.setItem(
      'ccg.newGame.v1',
      JSON.stringify({ '0': 'starter:Aggro', '1': 'surprise' }),
    );

    expect(loadChoices()).toEqual({ '0': RANDOM_ALL, '1': RANDOM_ALL });
  });
  it('keeps a random-deck choice and a saved-deck choice', () => {
    window.localStorage.setItem(
      'ccg.newGame.v1',
      JSON.stringify({ '0': RANDOM_DECK, '1': 'saved:a' }),
    );

    expect(loadChoices()).toEqual({ '0': RANDOM_DECK, '1': 'saved:a' });
  });
  it('defaults both seats to Core + Prime', () => {
    expect(loadChoices()).toEqual({ '0': RANDOM_ALL, '1': RANDOM_ALL });
  });
});
