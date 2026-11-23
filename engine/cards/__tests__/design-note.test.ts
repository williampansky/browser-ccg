import mechanics from '../../../data/mechanics.json';
import { loadHsCards } from '../load-hs-cards';

/**
 * A mechanic's display name as the data names it (Airtable renames it; the
 * tests follow).
 */
const nameOf = (symbol: string): string =>
  (mechanics as { symbol: string; name: string }[]).find(
    (m) => m.symbol === symbol,
  )!.name;

const { byId } = loadHsCards();

describe("the Airtable description field (a card's rules note)", () => {
  it('is kept on the card as plain text (CORE_115)', () => {
    expect(byId.get('CORE_115')!.designNote).toBe(
      'Spell can only be cast on minions.',
    );
  });
  it('has its HTML removed and its symbols turned into names, never a raw %SYMBOL% (PRIME_114 names its On Death mechanic)', () => {
    const note = byId.get('PRIME_114')!.designNote!;
    expect(note).not.toMatch(/%|</);
    expect(note).toContain(nameOf('%ON_DEATH%'));
  });
  it('is left off a card whose row has no description', () => {
    expect(byId.get('CORE_027')!.designNote).toBeUndefined();
  });
  it('never contains a raw symbol on any card', () => {
    for (const c of Array.from(byId.values()))
      if (c.designNote) expect(c.designNote).not.toMatch(/%[A-Z_]+%/);
  });
});
