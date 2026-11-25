import {
  colourNumber,
  parseSpellTune,
  SPELL_FX_DEFAULTS,
} from '../spell-fx-tune';

describe('parseSpellTune', () => {
  it('returns the defaults for an empty query', () => {
    expect(parseSpellTune('')).toEqual(SPELL_FX_DEFAULTS);
  });

  it('applies numbers and hex colours over the defaults', () => {
    const tune = parseSpellTune('s_orbMs=500&s_lightningColour=FF0000');
    expect(tune.orbMs).toBe(500);
    expect(tune.lightningColour).toBe('ff0000');
    expect(tune.orbArc).toBe(SPELL_FX_DEFAULTS.orbArc);
  });

  it('ignores bad values and unknown fields', () => {
    const tune = parseSpellTune(
      's_orbMs=fast&s_orbHaloColour=red&s_nothing=1&s_orbEase=',
    );
    expect(tune).toEqual(SPELL_FX_DEFAULTS);
  });
});

describe('colourNumber', () => {
  it('turns a hex string into a number', () => {
    expect(colourNumber('8fb8ff')).toBe(0x8fb8ff);
  });
});
