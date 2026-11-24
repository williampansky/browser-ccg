import {
  cardSkillArt,
  heroImage,
  skillIconLayers,
  skillIconSrc,
} from '../hero-images';

describe('skill icons for a skill a card replaced', () => {
  it('uses the class skill file when no card replaced the skill', () => {
    expect(skillIconSrc('CLERIC', { index: 0 })).toBe(
      heroImage('CLERIC', 'skill-1'),
    );
    expect(skillIconLayers('CLERIC', 1)).toContain('/CLERIC/skill-1.jpg');
  });

  it("uses the replacing card's art, then the placeholder", () => {
    expect(skillIconSrc('CLERIC', { index: 0, artCardId: 'PRIME_181' })).toBe(
      '/images/sets/SET_PRIME/181-CARD.jpg',
    );
    expect(cardSkillArt('PRIME_181')).toBe(
      'url(/images/sets/SET_PRIME/181-CARD.jpg), url(/images/sets/PLACEHOLDER.jpg)',
    );
    expect(skillIconLayers('CLERIC', 1, 'PRIME_181')).toBe(
      cardSkillArt('PRIME_181'),
    );
  });
});
