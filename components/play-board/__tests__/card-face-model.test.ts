import { artBackground, artUrl, PLACEHOLDER_ART, FACE_HEIGHT, FACE_WIDTH, faceUnit, fitScale, RARITY_STYLE, rarityStyle, raceLabel, showsStats, typeLabel } from '../card-face-model';

describe('rarityStyle', () => {
  it('Free is a steel frame with no gem; Common green, Superior blue, Remarkable purple, Mythic red', () => {
    expect(rarityStyle('FREE')).toEqual({ color: 'STEEL', gem: false });
    expect(rarityStyle('COMMON')).toEqual({ color: 'GREEN', gem: true });
    expect(rarityStyle('SUPERIOR')).toEqual({ color: 'BLUE', gem: true });
    expect(rarityStyle('REMARKABLE')).toEqual({ color: 'PURPLE', gem: true });
    expect(rarityStyle('MYTHIC')).toEqual({ color: 'RED', gem: true });
  });
  it('falls back to the Free look for NONE, unknown and missing rarities', () => {
    for (const r of ['NONE', 'LEGENDARY', '', undefined]) expect(rarityStyle(r)).toEqual({ color: 'STEEL', gem: false });
  });
  it('every colour has a frame image and every gem has an image, and no two rarities share a colour', () => {
    const fs = require('fs');
    const path = require('path');
    const root = path.join(__dirname, '../../../public/images');
    const styles = Object.values(RARITY_STYLE);
    expect(new Set(styles.map((s) => s.color)).size).toBe(styles.length);
    for (const s of styles) {
      expect(fs.existsSync(path.join(root, 'frames', `${s.color}.png`))).toBe(true);
      if (s.gem) expect(fs.existsSync(path.join(root, 'ui', `gem-${s.color}.png`))).toBe(true);
    }
  });
  it('every rarity in the card data has a style of its own (not the fallback by accident)', () => {
    const rarities = new Set(
      [...require('../../../data/core.json'), ...require('../../../data/prime.json')].map((c: { rarity?: string }) => (c.rarity ?? '').replace(/%|RARITY_/g, ''))
    );
    for (const r of Array.from(rarities)) expect(Object.keys(RARITY_STYLE)).toContain(r);
  });
});

describe('typeLabel and raceLabel', () => {
  it('the banner is always the card type, whatever the race', () => {
    expect(typeLabel({ type: 'minion' })).toBe('minion');
    expect(typeLabel({ type: 'spell' })).toBe('spell');
    expect(typeLabel({ type: 'weapon' })).toBe('weapon');
    expect(typeLabel({ type: 'item' })).toBe('item');
  });
  it('a minion\'s race goes on its own tag, by its display name where there is one', () => {
    expect(raceLabel({ type: 'minion', race: 'SPRITE' })).toBe('SPRITE');
    expect(raceLabel({ type: 'minion', race: 'ELEMENT', raceName: 'Primordial' })).toBe('Primordial');
  });
  it('no tag for a race of NONE, a missing race, or a card that is not a minion', () => {
    expect(raceLabel({ type: 'minion', race: 'NONE' })).toBeUndefined();
    expect(raceLabel({ type: 'minion' })).toBeUndefined();
    expect(raceLabel({ type: 'spell', race: 'SPRITE' })).toBeUndefined();
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
