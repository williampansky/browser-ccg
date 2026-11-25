import {
  colourNumber,
  fxChain,
  SPELL_FX_PARENTS,
  tuneForSpell,
  parseSpellTune,
  SPELL_FX_DEFAULTS,
} from '../spell-fx-tune';

describe('parseSpellTune', () => {
  it('returns the defaults for an empty query', () => {
    expect(parseSpellTune('')).toEqual(SPELL_FX_DEFAULTS);
  });

  it('applies numbers, flags and hex colours over the defaults', () => {
    const tune = parseSpellTune(
      's_travelMs=500&s_strikeColour=FF0000&s_travelHasTrail=0',
    );
    expect(tune.travelMs).toBe(500);
    expect(tune.strikeColour).toBe('ff0000');
    expect(tune.travelHasTrail).toBe(false);
    expect(tune.travelArc).toBe(SPELL_FX_DEFAULTS.travelArc);
  });

  it('reads the volley count and delay', () => {
    const tune = parseSpellTune('s_volleyCount=3&s_volleyDelay=150');
    expect(tune.volleyCount).toBe(3);
    expect(tune.volleyDelay).toBe(150);
    expect(SPELL_FX_DEFAULTS.volleyCount).toBe(1);
  });

  it('takes a listed word for a choice and refuses any other', () => {
    expect(parseSpellTune('s_spotSparkMotion=rising').spotSparkMotion).toBe(
      'rising',
    );
    expect(parseSpellTune('s_spotRingsMotion=ff0000')).toEqual(
      SPELL_FX_DEFAULTS,
    );
  });

  it('ignores bad values and unknown fields', () => {
    const tune = parseSpellTune(
      's_travelMs=fast&s_travelColour=red&s_nothing=1&s_travelEase=&s_spotHasGlow=2',
    );
    expect(tune).toEqual(SPELL_FX_DEFAULTS);
  });
});

describe('colourNumber', () => {
  it('turns a hex string into a number', () => {
    expect(colourNumber('8fb8ff')).toBe(0x8fb8ff);
  });
});

describe('parents', () => {
  it('chains a child after its parent, and a lone key is its own chain', () => {
    expect(fxChain('CRUSADER:1')).toEqual(['summon', 'CRUSADER:1']);
    expect(fxChain('WIZARD:1')).toEqual(['WIZARD:1']);
    expect(fxChain(null)).toEqual([]);
  });

  it('starts a child from its parent look', () => {
    expect(SPELL_FX_PARENTS['MYSTIC:1']).toBe('summon');
    expect(tuneForSpell('MYSTIC:1').spotRadius).toBe(
      tuneForSpell('summon').spotRadius,
    );
  });
});

describe('area choices', () => {
  it('takes the listed words for the style, region and direction only', () => {
    const tune = parseSpellTune(
      's_areaStyle=sweep&s_areaRegion=both&s_areaDirection=out',
    );
    expect([tune.areaStyle, tune.areaRegion, tune.areaDirection]).toEqual([
      'sweep',
      'both',
      'out',
    ]);
    expect(parseSpellTune('s_areaStyle=spiral').areaStyle).toBe('swirl');
  });
});
