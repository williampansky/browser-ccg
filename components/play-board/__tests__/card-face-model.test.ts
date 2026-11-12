import { artUrl, FACE_HEIGHT, FACE_WIDTH, faceUnit, frameFor, gemFor, showsStats, typeLabel } from '../card-face-model';

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
