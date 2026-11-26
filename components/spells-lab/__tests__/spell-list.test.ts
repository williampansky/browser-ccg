import { spellEntries } from '../spell-list';

describe('spellEntries', () => {
  const entries = spellEntries();

  it('lists the Wizard first skill and spell cards, neutral and class', () => {
    const keys = entries.map((entry) => entry.key);
    expect(keys).toContain('WIZARD:1');
    expect(keys).toContain('summon');
    expect(keys).toContain('CORE_069');
    expect(entries.some((e) => e.group === 'Neutral cards')).toBe(true);
    expect(entries.some((e) => e.group === 'Wizard cards')).toBe(true);
  });

  it('has unique keys and labels, so a typed label picks one spell', () => {
    expect(new Set(entries.map((e) => e.key)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.label)).size).toBe(entries.length);
  });

  it('lists minions with a trigger or an On Play effect, by card id', () => {
    const minions = entries.filter((entry) => entry.group === 'Minions');

    // PRIME_245 fires at the end of its owner's turn
    expect(minions.map((entry) => entry.key)).toContain('PRIME_245');
    expect(minions.length).toBeGreaterThan(20);
    expect(minions.every((entry) => !entry.isSkill)).toBe(true);
  });
});
