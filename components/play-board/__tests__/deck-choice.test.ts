import { aiDeckChoice, deckOptions, RANDOM_DECK, RANDOM_STARTER, resolveDeck, SURPRISE } from '../deck-choice';
import { loadHsCards, MAX_DECK_SIZE, playablePool, createSeededRng } from '../../../engine';
import { STARTER_DECKS } from '../../../engine/starter-decks';

const { cards } = loadHsCards();
const pool = playablePool(cards);
const saved = [
  { id: 'a', name: 'Mine', cards: ['CORE_001', 'CORE_001'] },
  { id: 'b', name: 'Empty', cards: [] },
];

describe('deck choice', () => {
  it('lists random, every starter deck, and the saved decks that have cards', () => {
    const values = deckOptions(saved).map((o) => o.value);
    expect(values).toEqual([SURPRISE, RANDOM_STARTER, RANDOM_DECK, ...STARTER_DECKS.map((d) => `starter:${d.name}`), 'saved:a']);
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
});
