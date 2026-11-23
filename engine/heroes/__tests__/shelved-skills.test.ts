import { getHero, heroes } from '..';

describe('the shelved skills (real SKILLS data)', () => {
  it('offers all nine classes, each with its first skill active', () => {
    expect(heroes().map((h) => h.id)).toEqual([
      'FIGHTER',
      'WIZARD',
      'RANGER',
      'CLERIC',
      'CRUSADER',
      'ASSASSIN',
      'MYSTIC',
      'NECROMANCER',
      'WARDEN',
    ]);
  });
  it('gives each only its first skill, at 2 energy with a 1 turn cooldown', () => {
    for (const h of heroes()) {
      expect(h.skills.map((s) => [s.index, s.cost, s.cooldown])).toEqual([
        [0, 2, 1],
      ]);
    }
  });
  it('keeps skills 2 and 3 out even where the table still has text for them', () => {
    expect(getHero('CRUSADER')!.skills).toHaveLength(1);
    expect(getHero('WIZARD')!.skills).toHaveLength(1);
  });
});
