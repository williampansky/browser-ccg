import { createSeededRng } from '../../../engine';
import {
  HERO_NONE,
  HERO_RANDOM,
  heroOptions,
  normalizeHeroChoice,
  resolveHero,
} from '../hero-choice';

describe('hero choice', () => {
  it('lists Random, the six heroes and No hero skills', () => {
    expect(heroOptions().map((o) => o.value)).toEqual([
      HERO_RANDOM,
      'FIGHTER',
      'WIZARD',
      'RANGER',
      'CLERIC',
      'NECROMANCER',
      'WARDEN',
      HERO_NONE,
    ]);
  });
  it('resolves a named hero, none, and random to a real hero', () => {
    const rng = createSeededRng(3);
    expect(resolveHero('FIGHTER', rng)).toBe('FIGHTER');
    expect(resolveHero(HERO_NONE, rng)).toBeUndefined();
    const seen = new Set(
      Array.from({ length: 60 }, () => resolveHero(HERO_RANDOM, rng)),
    );
    expect(seen.size).toBe(6);
  });
  it('turns anything unknown into Random', () => {
    expect(normalizeHeroChoice('NOPE')).toBe(HERO_RANDOM);
    expect(normalizeHeroChoice(4)).toBe(HERO_RANDOM);
    expect(normalizeHeroChoice('WIZARD')).toBe('WIZARD');
  });
  it('turns an old hero key into its class key', () => {
    expect(normalizeHeroChoice('ZEUS')).toBe('WIZARD');
    expect(normalizeHeroChoice('WARRIOR')).toBe('FIGHTER');
    expect(normalizeHeroChoice('FORSAKEN_DRUID')).toBe('WARDEN');
  });
});
