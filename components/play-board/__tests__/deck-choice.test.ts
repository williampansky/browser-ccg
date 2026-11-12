import { aiDeckChoice, deckOptions, RANDOM_ALL, RANDOM_DECK, RANDOM_STARTER, RANDOM_STARTER_BOTH, RANDOM_STARTER_PRIME, resolveDeck, SURPRISE } from '../deck-choice';
import { loadHsCards, MAX_DECK_SIZE, playablePool, primePool, createSeededRng } from '../../../engine';
import { ALL_STARTER_DECKS, MIXED_STARTER_DECKS, poolFor, PRIME_STARTER_DECKS, STARTER_DECKS } from '../../../engine/starter-decks';

const { cards } = loadHsCards();
const pool = playablePool(cards);
const saved = [
  { id: 'a', name: 'Mine', cards: ['CORE_001', 'CORE_001'] },
  { id: 'b', name: 'Empty', cards: [] },
];

const prime = primePool(cards);

describe('Prime and mixed starter decks', () => {
  it('every starter deck, whatever its set, is 30 distinct cards from its own pool, and the names are unique', () => {
    expect(new Set(ALL_STARTER_DECKS.map((d) => d.name)).size).toBe(ALL_STARTER_DECKS.length);
    for (const d of ALL_STARTER_DECKS) {
      const { cards: ids } = resolveDeck(`starter:${d.name}`, pool, [], createSeededRng(1), prime);
      expect([d.name, ids.length]).toEqual([d.name, MAX_DECK_SIZE]);
      expect(new Set(ids).size).toBe(ids.length);
      const allowed = new Set(poolFor(d.set, pool, prime).map((c) => c.id));
      ids.forEach((id) => expect(allowed.has(id)).toBe(true));
    }
  });
  it('Prime decks hold only PRIME cards; mixed decks hold both; Core decks only CORE', () => {
    const sourceOf = (name: string) =>
      new Set(resolveDeck(`starter:${name}`, pool, [], createSeededRng(1), prime).cards.map((id) => (id.startsWith('PRIME') ? 'prime' : 'core')));
    for (const d of PRIME_STARTER_DECKS) expect(Array.from(sourceOf(d.name))).toEqual(['prime']);
    for (const d of STARTER_DECKS) expect(Array.from(sourceOf(d.name))).toEqual(['core']);
    expect(MIXED_STARTER_DECKS.some((d) => sourceOf(d.name).size === 2)).toBe(true);
  });
  it('each deck within a set is different from the others', () => {
    for (const set of [STARTER_DECKS, PRIME_STARTER_DECKS, MIXED_STARTER_DECKS]) {
      const lists = set.map((d) => resolveDeck(`starter:${d.name}`, pool, [], createSeededRng(1), prime).cards.slice().sort().join());
      expect(new Set(lists).size).toBe(lists.length);
    }
  });
  it('the random Prime and mixed starter choices pick from their own decks, and the AI may use them', () => {
    const names = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) names.add(resolveDeck(RANDOM_STARTER_PRIME, pool, [], createSeededRng(seed), prime).name);
    expect(Array.from(names).every((n) => PRIME_STARTER_DECKS.some((d) => d.name === n))).toBe(true);
    expect(names.size).toBeGreaterThan(1);
    const mixed = resolveDeck(RANDOM_STARTER_BOTH, pool, [], createSeededRng(3), prime).name;
    expect(MIXED_STARTER_DECKS.some((d) => d.name === mixed)).toBe(true);
    expect(aiDeckChoice('starter:Mysteries')).toBe('starter:Mysteries');
    expect(aiDeckChoice(RANDOM_STARTER_PRIME)).toBe(RANDOM_STARTER_PRIME);
  });
  it('SURPRISE and Random starter stay Core-only, so the Core balance numbers are unchanged', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const r = resolveDeck(RANDOM_STARTER, pool, [], createSeededRng(seed), prime);
      expect(STARTER_DECKS.some((d) => d.name === r.name)).toBe(true);
    }
  });
});

describe('deck choice', () => {
  it('lists random, every starter deck, and the saved decks that have cards', () => {
    const values = deckOptions(saved).map((o) => o.value);
    expect(values).toEqual([
      SURPRISE,
      RANDOM_STARTER,
      RANDOM_STARTER_PRIME,
      RANDOM_STARTER_BOTH,
      RANDOM_DECK,
      RANDOM_ALL,
      ...ALL_STARTER_DECKS.map((d) => `starter:${d.name}`),
      'saved:a',
    ]);
  });
  it('there are at least five starter decks, all different', () => {
    const decks = STARTER_DECKS.map((d) => resolveDeck(`starter:${d.name}`, pool, [], createSeededRng(1)).cards.join());
    expect(STARTER_DECKS.length).toBeGreaterThanOrEqual(5);
    expect(new Set(decks).size).toBe(decks.length);
  });
  it('every starter deck has 30 cards and plays only playable pool cards', () => {
    for (const d of STARTER_DECKS) {
      const { cards: ids } = resolveDeck(`starter:${d.name}`, pool, [], createSeededRng(1));
      expect(ids).toHaveLength(MAX_DECK_SIZE);
      ids.forEach((id) => expect(pool.some((c) => c.id === id)).toBe(true));
    }
  });
  it('resolves a saved deck as is, and falls back to a 30-card random deck for a missing or empty one', () => {
    expect(resolveDeck('saved:a', pool, saved, createSeededRng(1)).cards).toEqual(['CORE_001', 'CORE_001']);
    for (const choice of [SURPRISE, RANDOM_STARTER, 'saved:gone', 'saved:b', 'starter:Nope', RANDOM_DECK]) {
      expect(resolveDeck(choice, pool, saved, createSeededRng(1)).cards).toHaveLength(MAX_DECK_SIZE);
    }
  });
  it('the AI seat never gets a saved deck: it keeps a starter or random choice, anything else becomes a random starter', () => {
    expect(aiDeckChoice('saved:a')).toBe(SURPRISE);
    expect(aiDeckChoice('garbage')).toBe(SURPRISE);
    expect(aiDeckChoice('starter:Aggro')).toBe('starter:Aggro');
    expect(aiDeckChoice(RANDOM_DECK)).toBe(RANDOM_DECK);
  });
  it('a random starter choice is one of the starter decks, and varies with the seed', () => {
    const starters = STARTER_DECKS.map((d) => d.name);
    const names = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const r = resolveDeck(RANDOM_STARTER, pool, saved, createSeededRng(seed));
      expect(starters).toContain(r.name);
      names.add(r.name);
    }
    expect(names.size).toBeGreaterThan(1);
  });
  it('SURPRISE is a random deck about 1 game in 10 and a starter deck otherwise', () => {
    const starters = STARTER_DECKS.map((d) => d.name);
    let random = 0;
    const games = 2000;
    for (let seed = 1; seed <= games; seed++) {
      const r = resolveDeck(SURPRISE, pool, saved, createSeededRng(seed));
      if (r.name === 'a random deck') random += 1;
      else expect(starters).toContain(r.name);
    }
    expect(random / games).toBeGreaterThan(0.07);
    expect(random / games).toBeLessThan(0.13);
  });
  it('only the Core + Prime choice can deal PRIME cards; CORE-only choices never do', () => {
    const prime = primePool(cards);
    const isPrime = (id: string) => prime.some((c) => c.id === id);
    let sawPrime = false;
    for (let seed = 1; seed <= 40; seed++) {
      const all = resolveDeck(RANDOM_ALL, pool, [], createSeededRng(seed), prime);
      expect(all.cards).toHaveLength(MAX_DECK_SIZE);
      if (all.cards.some(isPrime)) sawPrime = true;
      for (const choice of [RANDOM_DECK, SURPRISE, RANDOM_STARTER, 'starter:Aggro']) {
        expect(resolveDeck(choice, pool, [], createSeededRng(seed), prime).cards.some(isPrime)).toBe(false);
      }
    }
    expect(sawPrime).toBe(true);
  });
  it('the AI seat may be given the Core + Prime choice', () => {
    expect(aiDeckChoice(RANDOM_ALL)).toBe(RANDOM_ALL);
  });
});
