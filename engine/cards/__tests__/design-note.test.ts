import { loadHsCards } from '../load-hs-cards';

const { byId } = loadHsCards();

describe('the Airtable description field (a card\'s rules note)', () => {
  it('is kept on the card as plain text (CORE_115)', () => {
    expect(byId.get('CORE_115')!.designNote).toBe('Spell can only be cast on minions.');
  });
  it('has its HTML removed and its symbols turned into names, never a raw %SYMBOL% (PRIME_114 names On Death)', () => {
    const note = byId.get('PRIME_114')!.designNote!;
    expect(note).not.toMatch(/%|</);
    expect(note).toContain('Demise');
  });
  it('is left off a card whose row has no description', () => {
    expect(byId.get('CORE_027')!.designNote).toBeUndefined();
  });
  it('never contains a raw symbol on any card', () => {
    for (const c of Array.from(byId.values())) if (c.designNote) expect(c.designNote).not.toMatch(/%[A-Z_]+%/);
  });
});
