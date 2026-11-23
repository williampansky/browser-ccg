import { loadHsCards } from '../load-hs-cards';
import { effectsOf } from '../card-effects';

const { byId } = loadHsCards();
const symbols = (id: string) => effectsOf(byId.get(id)!).map((e) => e.symbol);

describe('effectsOf', () => {
  it("lists exactly the card's mechanics array, in its order (CORE_007)", () => {
    expect(symbols('CORE_007')).toEqual(
      byId.get('CORE_007')!.mechanics.map((m) => m.replace(/%/g, '')),
    );
  });

  it('hides no tag: bookkeeping ones are listed too (CORE_123 is tagged TARGET)', () => {
    expect(symbols('CORE_123')).toContain('TARGET');
  });

  it('does not add a keyword the text names but the array lacks (CORE_099 names Buff in its text only)', () => {
    expect(byId.get('CORE_099')!.mechanics).not.toContain('BUFF');
    expect(symbols('CORE_099')).not.toContain('BUFF');
  });

  it('gives each effect its display name and a full-sentence description', () => {
    for (const e of effectsOf(byId.get('CORE_007')!)) {
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.description.length).toBeGreaterThan(15);
    }
  });

  it('lists a card tagged only EVENT (PRIME_086) as Event', () => {
    expect(symbols('PRIME_086')).toEqual(['EVENT']);
  });

  it('lists Random for a card that has it (CORE_063 is tagged RANDOM and DAMAGE)', () => {
    expect(symbols('CORE_063')).toContain('RANDOM');
  });

  it('never lists an effect twice, and never shows a placeholder', () => {
    for (const c of Array.from(byId.values())) {
      const list = effectsOf(c);
      expect(new Set(list.map((e) => e.symbol)).size).toBe(list.length);
      for (const e of list) expect(e.description).not.toMatch(/[{}]/);
    }
  });
});
