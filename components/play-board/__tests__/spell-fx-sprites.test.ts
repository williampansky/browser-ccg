import fs from 'fs';
import path from 'path';

import { SPELL_GROUPS } from '../../spells-lab/spell-knobs';
import { SPELL_FX_SPRITES, spriteById, spriteUrl } from '../spell-fx-sprites';
import { SPELL_FX_CHOICES, SPELL_FX_DEFAULTS } from '../spell-fx-tune';

const ids = SPELL_FX_SPRITES.map((sprite) => sprite.id);

describe('spell effect pictures', () => {
  it('has a file for each picture', () => {
    for (const id of ids) {
      const file = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        spriteUrl(id),
      );
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  it('lists the same pictures in the choices and in the lab drop-down', () => {
    expect(SPELL_FX_CHOICES.travelSprite).toEqual(ids);
    const options = SPELL_GROUPS.flatMap((group) => group.choices ?? [])
      .filter((choice) => choice.field === 'travelSprite')
      .flatMap((choice) => choice.options.map((option) => option.value));
    expect(options).toEqual(ids);
    expect(ids).toContain(SPELL_FX_DEFAULTS.travelSprite);
  });

  it('falls back to the first picture for an unknown id', () => {
    expect(spriteById('nope').id).toBe(ids[0]);
  });
});
