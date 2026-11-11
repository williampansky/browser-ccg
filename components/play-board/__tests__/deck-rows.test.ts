import { deckRows } from '../deck-rows';
import { catalogOf, minionCard } from '../../../engine/testing/builders';

const a = { ...minionCard('A', { cost: 3 }), name: 'Alpha' };
const b = { ...minionCard('B', { cost: 1 }), name: 'Beta' };
const c = { ...minionCard('C', { cost: 3 }), name: 'Aardvark' };
const catalog = catalogOf(a, b, c);

describe('deckRows', () => {
  it('counts copies at the start and still in the deck, sorted by cost then name', () => {
    const rows = deckRows(['A', 'A', 'B', 'C'], ['A', 'C'], catalog);
    expect(rows.map((r) => [r.name, r.total, r.left])).toEqual([
      ['Beta', 1, 0],
      ['Aardvark', 1, 1],
      ['Alpha', 2, 1],
    ]);
  });
  it('lists a card shuffled in mid-game with its current copies as the total', () => {
    expect(deckRows(['B'], ['B', 'A'], catalog).map((r) => [r.id, r.total, r.left])).toEqual([
      ['B', 1, 1],
      ['A', 1, 1],
    ]);
  });
});
