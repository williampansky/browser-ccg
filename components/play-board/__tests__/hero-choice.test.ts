import { createSeededRng } from '../../../engine';
import { HERO_NONE, HERO_RANDOM, heroOptions, normalizeHeroChoice, resolveHero } from '../hero-choice';

describe('hero choice', () => {
  it('lists Random, the five heroes and No hero skills', () => {
    expect(heroOptions().map((o) => o.value)).toEqual([HERO_RANDOM, 'ZEUS', 'FORSAKEN_DRUID', 'EXILE', 'WARRIOR', 'SAGE', HERO_NONE]);
  });
  it('resolves a named hero, none, and random to a real hero', () => {
    const rng = createSeededRng(3);
    expect(resolveHero('WARRIOR', rng)).toBe('WARRIOR');
    expect(resolveHero(HERO_NONE, rng)).toBeUndefined();
    const seen = new Set(Array.from({ length: 60 }, () => resolveHero(HERO_RANDOM, rng)));
    expect(seen.size).toBe(5);
  });
  it('turns anything unknown into Random', () => {
    expect(normalizeHeroChoice('NOPE')).toBe(HERO_RANDOM);
    expect(normalizeHeroChoice(4)).toBe(HERO_RANDOM);
    expect(normalizeHeroChoice('ZEUS')).toBe('ZEUS');
  });
});
