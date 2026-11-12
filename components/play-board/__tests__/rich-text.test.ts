import { sanitizeRichText } from '../../../engine';
import { parseRichText } from '../card-face-model';

describe('card rich text', () => {
  it('keeps line breaks and small/strong tags, drops the rest', () => {
    expect(sanitizeRichText("<strong>X</strong><br>\nDestroy your<br >\nopponent's <b>weapon</b>")).toBe(
      "<strong>X</strong><br>Destroy your<br>opponent's weapon"
    );
    expect(sanitizeRichText('A<br />\n<small>Why</small>')).toBe('A<br><small>Why</small>');
  });

  it('parses into parts', () => {
    expect(parseRichText('<strong>Rush</strong><br>Go <small>now</small>')).toEqual([
      { kind: 'strong', text: 'Rush' },
      { kind: 'br' },
      { kind: 'text', text: 'Go ' },
      { kind: 'small', text: 'now' },
    ]);
  });
});

import { withSpellDamageText } from '../card-face-model';
describe('spell damage text', () => {
  it('raises each damage number and marks it', () => {
    expect(withSpellDamageText('Deal 2 damage<br>and 1 damage', 1)).toBe(
      'Deal <boost>3</boost> damage<br>and <boost>2</boost> damage'
    );
    expect(withSpellDamageText('Deal 2 damage', 0)).toBe('Deal 2 damage');
  });
});
