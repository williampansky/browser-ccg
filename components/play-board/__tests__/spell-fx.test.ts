import { spellFxFor } from '../spell-fx';

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
