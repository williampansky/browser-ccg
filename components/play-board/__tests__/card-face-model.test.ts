import { artBackground, artUrl, PLACEHOLDER_ART, FACE_HEIGHT, FACE_WIDTH, faceUnit, fitScale, frameFor, gemFor, showsStats, typeLabel } from '../card-face-model';

describe('frameFor', () => {
  it('uses the frame of a known rarity', () => {
    expect(frameFor('COMMON')).toBe('COMMON');
    expect(frameFor('REMARKABLE')).toBe('REMARKABLE');
    expect(frameFor('SUPERIOR')).toBe('SUPERIOR');
    expect(frameFor('MYTHIC')).toBe('MYTHIC');
    expect(frameFor('FREE')).toBe('FREE');
  });
  it('falls back to the plain frame for NONE, unknown and missing rarities', () => {
    expect(frameFor('NONE')).toBe('FREE');
    expect(frameFor('LEGENDARY')).toBe('FREE');
    expect(frameFor(undefined)).toBe('FREE');
    expect(frameFor('')).toBe('FREE');
  });
  it('gives the gem the same fallback', () => {
    expect(gemFor('NONE')).toBe('FREE');
    expect(gemFor('MYTHIC')).toBe('MYTHIC');
  });
});

describe('typeLabel', () => {
  it('shows a minion\'s race', () => {
    expect(typeLabel({ type: 'minion', race: 'SPRITE' })).toBe('SPRITE');
  });
  it('shows the type for a minion with no race, and for other cards', () => {
    expect(typeLabel({ type: 'minion', race: 'ELEMENT', raceName: 'Primordial' })).toBe('Primordial');
    expect(typeLabel({ type: 'minion', race: 'NONE' })).toBe('minion');
    expect(typeLabel({ type: 'minion' })).toBe('minion');
    expect(typeLabel({ type: 'spell', race: 'SPRITE' })).toBe('spell');
  });
});

describe('showsStats and faceUnit', () => {
  it('shows stats for minions and weapons only', () => {
    expect(showsStats('minion')).toBe(true);
    expect(showsStats('weapon')).toBe(true);
    expect(showsStats('spell')).toBe(false);
    expect(showsStats('item')).toBe(false);
  });
  it('scales the design size to the real width', () => {
    expect(faceUnit(FACE_WIDTH)).toBe(1);
    expect(faceUnit(FACE_WIDTH * 2)).toBe(2);
    expect(FACE_HEIGHT / FACE_WIDTH).toBeCloseTo(1.4, 1);
  });
});

describe('artUrl', () => {
  it('maps a card id to its art file', () => {
    expect(artUrl('CORE_012')).toBe('/images/sets/SET_CORE/012-CARD.jpg');
    expect(artUrl('CORE_057b')).toBe('/images/sets/SET_CORE/057b-CARD.jpg');
    expect(artUrl('GAME_001')).toBe('/images/sets/SET_GAME/001-CARD.jpg');
  });
  it('gives nothing for a missing or malformed id', () => {
    expect(artUrl(undefined)).toBeUndefined();
    expect(artUrl('nonsense')).toBeUndefined();
  });
});

describe('fitScale', () => {
  it('keeps full size when the text already fits', () => {
    expect(fitScale(() => true)).toBe(1);
  });
  it('steps down to the largest scale that fits', () => {
    expect(fitScale((s) => s <= 0.8)).toBeCloseTo(0.8);
    expect(fitScale((s) => s <= 0.77)).toBeCloseTo(0.75);
  });
  it('stops at the minimum when nothing fits', () => {
    expect(fitScale(() => false)).toBe(0.55);
    expect(fitScale(() => false, 0.7)).toBe(0.7);
  });
  it('never asks about a scale below the minimum', () => {
    const asked: number[] = [];
    fitScale((s) => (asked.push(s), false), 0.7);
    expect(Math.min(...asked)).toBeGreaterThan(0.7);
  });
});

describe('artBackground', () => {
  it('puts the card art over the placeholder, so a missing file shows the placeholder', () => {
    expect(artBackground('CORE_012')).toBe(`url(/images/sets/SET_CORE/012-CARD.jpg), url(${PLACEHOLDER_ART})`);
    expect(artBackground('PRIME_010')).toBe(`url(/images/sets/SET_PRIME/010-CARD.jpg), url(${PLACEHOLDER_ART})`);
  });
  it('is just the placeholder for a missing or malformed id', () => {
    expect(artBackground(undefined)).toBe(`url(${PLACEHOLDER_ART})`);
    expect(artBackground('nonsense')).toBe(`url(${PLACEHOLDER_ART})`);
  });
  it('layers fallback cards between the card and the placeholder, without repeats', () => {
    expect(artBackground('CORE_001', 'CORE_002')).toBe(`url(/images/sets/SET_CORE/001-CARD.jpg), url(/images/sets/SET_CORE/002-CARD.jpg), url(${PLACEHOLDER_ART})`);
    expect(artBackground('CORE_001', 'CORE_001', undefined)).toBe(`url(/images/sets/SET_CORE/001-CARD.jpg), url(${PLACEHOLDER_ART})`);
  });
});
