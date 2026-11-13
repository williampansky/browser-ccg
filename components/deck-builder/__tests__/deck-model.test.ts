import { addCard, blankDeck, cleanDeck, curve, removeCard, whyNotAdd } from '../deck-model';
import { catalogOf, minionCard } from '../../../engine/testing/builders';

const cards = Array.from({ length: 40 }, (_, i) => minionCard(`CORE_${String(i).padStart(3, '0')}`, { cost: i % 9 }));
const legend = { ...minionCard('CORE_900'), rarity: 'MYTHIC' };
const byId = catalogOf(...cards, legend);

describe('deck model', () => {
  it('adds cards sorted by cost and allows two copies, not three', () => {
    let d = blankDeck();
    d = addCard(d, cards[5], byId);
    d = addCard(d, cards[1], byId);
    d = addCard(d, cards[1], byId);
    d = addCard(d, cards[1], byId);
    expect(d.cards).toEqual(['CORE_001', 'CORE_001', 'CORE_005']);
  });
  it('allows one copy of a MYTHIC card', () => {
    const d = addCard(blankDeck(), legend, byId);
    expect(whyNotAdd(d, legend)).toMatch(/mythic/);
    expect(addCard(d, legend, byId)).toBe(d);
  });
  it('stops at 30 cards', () => {
    let d = blankDeck();
    cards.slice(0, 15).forEach((c) => {
      d = addCard(addCard(d, c, byId), c, byId);
    });
    expect(d.cards).toHaveLength(30);
    expect(whyNotAdd(d, cards[20])).toMatch(/full/);
    expect(addCard(d, cards[20], byId)).toBe(d);
  });
  it('removes one copy at a time', () => {
    let d = addCard(addCard(blankDeck(), cards[2], byId), cards[2], byId);
    d = removeCard(d, 'CORE_002');
    expect(d.cards).toEqual(['CORE_002']);
    expect(removeCard(d, 'CORE_999')).toBe(d);
  });
  it('cleanDeck drops unknown cards and anything over the limits', () => {
    const d = cleanDeck({ id: 'x', name: 'x', cards: ['NOPE', ...Array(35).fill('CORE_001')] }, byId);
    expect(d.cards).toEqual(['CORE_001', 'CORE_001']);
    const big = cleanDeck({ id: 'x', name: 'x', cards: cards.flatMap((c) => [c.id, c.id]) }, byId);
    expect(big.cards).toHaveLength(30);
  });
  it('curve buckets by cost with 7+ together', () => {
    const d = { ...blankDeck(), cards: ['CORE_000', 'CORE_007', 'CORE_008'] };
    expect(curve(d, byId)).toEqual([1, 0, 0, 0, 0, 0, 0, 2]);
  });
});

describe('deck hero', () => {
  it('cleanDeck keeps the deck hero', () => {
    const deck = { id: 'd', name: 'D', cards: [], hero: 'ZEUS' };
    expect(cleanDeck(deck, new Map()).hero).toBe('ZEUS');
  });
});
