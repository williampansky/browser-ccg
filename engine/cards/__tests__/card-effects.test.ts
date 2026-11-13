import { loadHsCards } from '../load-hs-cards';
import { effectsOf } from '../card-effects';

const { byId } = loadHsCards();
const symbols = (id: string) => effectsOf(byId.get(id)!).map((e) => e.symbol);

describe('effectsOf', () => {
  it('lists the keywords named in the card text first, then its other tags (CORE_007)', () => {
    expect(symbols('CORE_007')).toEqual(['NO_ATTACK', 'DESTROY', 'ON_PLAY']);
  });

  it('leaves out internal tags players have no use for (CORE_123 is tagged TARGET)', () => {
    expect(symbols('CORE_123')).toEqual(['RUSH', 'BUFF']);
  });

  it('gives each effect its display name and a full-sentence description', () => {
    for (const e of effectsOf(byId.get('CORE_007')!)) {
      expect(e.name.length).toBeGreaterThan(0);
      expect(e.description.length).toBeGreaterThan(15);
    }
  });

  it('is empty for a card with no player-facing effect tags (PRIME_086 is tagged only EVENT)', () => {
    expect(symbols('PRIME_086')).toEqual([]);
  });

  it('never lists an effect twice, and never shows a placeholder', () => {
    for (const c of Array.from(byId.values())) {
      const list = effectsOf(c);
      expect(new Set(list.map((e) => e.symbol)).size).toBe(list.length);
      for (const e of list) expect(e.description).not.toMatch(/[{}]/);
    }
  });
});
