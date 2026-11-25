import { spellFxFor, spellFxForKey, spellFxMs, spellKeyFor } from '../spell-fx';
import { SPELL_FX_DEFAULTS } from '../spell-fx-tune';

describe('spellFxFor', () => {
  it('gives the Wizard first skill the strike base', () => {
    expect(
      spellFxFor({ type: 'HeroSkill', skill: 0 }, 'WIZARD', undefined),
    ).toBe('strike');
  });

  it('keeps a skill from borrowing a card look, and the reverse', () => {
    expect(
      spellFxFor({ type: 'HeroSkill', skill: 0 }, 'RANGER', undefined),
    ).toBe('travel');
    expect(
      spellFxFor({ type: 'PlayCard', handIndex: 0 }, 'WIZARD', 'CORE_069'),
    ).toBe('travel');
  });

  it('falls back to the travel base for anything else', () => {
    expect(spellFxFor({ type: 'EndTurn' }, 'WIZARD', undefined)).toBe('travel');
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
    expect(spellFxForKey('WIZARD:1')).toBe('strike');
    expect(spellFxForKey('CORE_069')).toBe('travel');
  });
});

describe('the spot kind', () => {
  it('gives the Fighter first skill the spot base', () => {
    expect(spellFxForKey('FIGHTER:1')).toBe('spot');
  });

  it('starts at the cast, so its hit delay is zero', () => {
    expect(spellFxMs('spot', SPELL_FX_DEFAULTS)).toBe(0);
    expect(spellFxMs('travel', SPELL_FX_DEFAULTS)).toBe(
      SPELL_FX_DEFAULTS.travelMs,
    );
  });
});

describe('event effects', () => {
  it('gives every summon the spot base', () => {
    expect(spellFxForKey('summon')).toBe('spot');
  });
});

describe('inherited base', () => {
  it('gives a summoning skill its parent base without an entry of its own', () => {
    expect(spellFxForKey('CRUSADER:1')).toBe('spot');
    expect(spellFxForKey('MYSTIC:1')).toBe('spot');
  });
});
