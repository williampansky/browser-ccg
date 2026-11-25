import { spellFxFor, spellFxForKey, spellKeyFor } from '../spell-fx';

describe('spellFxFor', () => {
  it('gives the Wizard first skill the lightning strike', () => {
    expect(
      spellFxFor({ type: 'HeroSkill', skill: 0 }, 'WIZARD', undefined),
    ).toBe('lightning');
  });

  it('keeps a skill from borrowing a card look, and the reverse', () => {
    expect(
      spellFxFor({ type: 'HeroSkill', skill: 0 }, 'FIGHTER', undefined),
    ).toBe('orb');
    expect(
      spellFxFor({ type: 'PlayCard', handIndex: 0 }, 'WIZARD', 'CORE_069'),
    ).toBe('orb');
  });

  it('falls back to the orb for anything else', () => {
    expect(spellFxFor({ type: 'EndTurn' }, 'WIZARD', undefined)).toBe('orb');
  });
});

describe('spellKeyFor and spellFxForKey', () => {
  it('keys a skill by class and number, a card by its id', () => {
    expect(
      spellKeyFor({ type: 'HeroSkill', skill: 0 }, 'WIZARD', undefined),
    ).toBe('WIZARD:1');
    expect(
      spellKeyFor({ type: 'PlayCard', handIndex: 2 }, 'WIZARD', 'CORE_069'),
    ).toBe('CORE_069');
    expect(spellKeyFor({ type: 'EndTurn' }, 'WIZARD', undefined)).toBeNull();
  });

  it('looks an effect up by key, defaulting to the orb', () => {
    expect(spellFxForKey('WIZARD:1')).toBe('lightning');
    expect(spellFxForKey('CORE_069')).toBe('orb');
  });
});
