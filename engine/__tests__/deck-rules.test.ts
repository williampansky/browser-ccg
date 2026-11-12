import { checkDeck, MAX_DECK_SIZE, maxCopies } from '../deck-rules';
import { buildDeck } from '../decks';
import { createGame } from '../state/create-game';
import { createSeededRng } from '../rng';
import { catalogOf, minionCard } from '../testing/builders';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `CORE_${String(i).padStart(3, '0')}`);
const byId = catalogOf(...ids(40).map((id) => minionCard(id)));

describe('deck rules', () => {
  it('a deck holds at most 30 cards', () => {
    expect(MAX_DECK_SIZE).toBe(30);
    expect(checkDeck(ids(30), byId).ok).toBe(true);
    expect(checkDeck(ids(31), byId).ok).toBe(false);
  });
  it('a deck with fewer than 30 cards is allowed', () => {
    expect(checkDeck(ids(5), byId).ok).toBe(true);
    expect(checkDeck([], byId).ok).toBe(true);
  });
  it('two copies of a card are allowed, three are not; a MYTHIC card is limited to one', () => {
    expect(maxCopies({ rarity: 'COMMON' })).toBe(2);
    expect(maxCopies({ rarity: 'MYTHIC' })).toBe(1);
    expect(checkDeck(['CORE_001', 'CORE_001'], byId).ok).toBe(true);
    expect(checkDeck(['CORE_001', 'CORE_001', 'CORE_001'], byId).ok).toBe(false);
    expect(checkDeck(['CORE_001', 'CORE_001', 'CORE_001'], byId, false).ok).toBe(true);
    const legend = catalogOf(minionCard('CORE_900', {}), { ...minionCard('CORE_901'), rarity: 'MYTHIC' });
    expect(checkDeck(['CORE_901', 'CORE_901'], legend).ok).toBe(false);
  });
  it('an unknown card id is an error', () => {
    expect(checkDeck(['NOPE_1'], byId).ok).toBe(false);
  });
  it('createGame refuses a deck of more than 30 cards, for either player', () => {
    const rng = () => createSeededRng(1);
    const ok = { '0': ids(30), '1': ids(30) };
    expect(() => createGame({ decks: ok, firstPlayer: '0' }, rng())).not.toThrow();
    expect(() => createGame({ decks: { ...ok, '0': ids(31) }, firstPlayer: '0' }, rng())).toThrow(/30/);
    expect(() => createGame({ decks: { ...ok, '1': ids(31) }, firstPlayer: '0' }, rng())).toThrow(/30/);
  });
  it('random decks are never larger than 30, even if more is asked for', () => {
    const pool = ids(40).map((id) => minionCard(id));
    expect(buildDeck(pool, createSeededRng(1))).toHaveLength(30);
    expect(buildDeck(pool, createSeededRng(1), 99)).toHaveLength(30);
  });
});
