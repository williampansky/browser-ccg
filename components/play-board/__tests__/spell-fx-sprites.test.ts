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
    expect(SPELL_FX_CHOICES.sprite).toEqual(ids);
    const groups = SPELL_GROUPS.flatMap((group) => group.choices ?? []).filter(
      (choice) => choice.field === 'sprite',
    );
    // One in each of the three bases that can show a picture.
    expect(groups).toHaveLength(3);
    for (const choice of groups) {
      expect(choice.options.map((option) => option.value)).toEqual(ids);
    }
    expect(ids).toContain(SPELL_FX_DEFAULTS.sprite);
  });

  it('falls back to the first picture for an unknown id', () => {
    expect(spriteById('nope').id).toBe(ids[0]);
  });
});

describe('adding a picture', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { plan, entryText } = require('../../../scripts/add-fx-sprite.node.js');

  it('accepts a new id and label', () => {
    expect(
      plan({ id: 'axe-test', label: 'Test axe', tip: -45, existing: '' }),
    ).toEqual([]);
  });

  it('refuses a duplicate id, a bad id, no label or a bad tip', () => {
    const existing = "{ id: 'axe-test', label: 'x', tip: 0 }";
    expect(plan({ id: 'axe-test', label: 'x', tip: 0, existing }).length).toBe(
      1,
    );
    expect(
      plan({ id: 'Axe Test', label: 'x', tip: 0, existing: '' }).length,
    ).toBe(1);
    expect(plan({ id: 'a', label: '', tip: 0, existing: '' }).length).toBe(1);
    expect(plan({ id: 'a', label: 'x', tip: NaN, existing: '' }).length).toBe(
      1,
    );
  });

  it('writes an entry in the array format, escaping quotes', () => {
    expect(entryText('axe-test', "Bob's axe", -90)).toBe(
      "  { id: 'axe-test', label: 'Bob\\'s axe', tip: -90 },\n",
    );
  });
});
