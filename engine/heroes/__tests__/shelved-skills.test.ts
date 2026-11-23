import { getHero, heroes } from '..';

describe('the shelved skills (real SKILLS data)', () => {
  it('offers the six classes that have skill code and an active skill', () => {
    expect(heroes().map((h) => h.id)).toEqual([
      'FIGHTER',
      'WIZARD',
      'RANGER',
      'CLERIC',
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
  it('offers no hero for a class whose skill is inactive or has no code', () => {
    for (const id of ['ASSASSIN', 'CRUSADER', 'MYSTIC']) {
      expect(getHero(id)).toBeUndefined();
    }
  });
});
