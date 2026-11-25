import { SPELL_FX_DEFAULTS } from '../../play-board/spell-fx-tune';
import { copyLookParams } from '../copy-look';

describe('copyLookParams', () => {
  it('lists only the fields that differ, as s_ params', () => {
    const source = {
      ...SPELL_FX_DEFAULTS,
      travelMs: 300,
      travelHasTrail: false,
      travelColour: 'ffffff',
      spotRingsMotion: 'in' as const,
    };
    expect(copyLookParams(source, SPELL_FX_DEFAULTS)).toEqual({
      s_travelMs: '300',
      s_travelHasTrail: '0',
      s_travelColour: 'ffffff',
      s_spotRingsMotion: 'in',
    });
  });

  it('is empty for the same look, and undoes fields the target had changed', () => {
    expect(copyLookParams(SPELL_FX_DEFAULTS, SPELL_FX_DEFAULTS)).toEqual({});
    const target = { ...SPELL_FX_DEFAULTS, burstCount: 40 };
    expect(copyLookParams(SPELL_FX_DEFAULTS, target)).toEqual({
      s_burstCount: String(SPELL_FX_DEFAULTS.burstCount),
    });
  });
});
