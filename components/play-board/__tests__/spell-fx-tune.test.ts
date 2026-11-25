import {
  colourNumber,
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
