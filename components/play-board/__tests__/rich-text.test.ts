import { sanitizeRichText } from '../../../engine';
import { parseRichText, softenBreaks, textLines } from '../card-face-model';

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
  it('parses boosted numbers into their own part', () => {
    expect(parseRichText('Deal <boost>3</boost> damage')).toEqual([
      { kind: 'text', text: 'Deal ' },
      { kind: 'boost', text: '3' },
      { kind: 'text', text: ' damage' },
    ]);
  });

  it('raises each damage number and marks it', () => {
    expect(withSpellDamageText('Deal 2 damage<br>and 1 damage', 1)).toBe(
      'Deal <boost>3</boost> damage<br>and <boost>2</boost> damage'
    );
    expect(withSpellDamageText('Deal 2 damage', 0)).toBe('Deal 2 damage');
  });
});

describe('softenBreaks', () => {
  it('turns a break in the middle of a sentence into a space (PRIME_086, PRIME_239)', () => {
    expect(softenBreaks('Costs 1 less for each card you<br>played this turn and last (max 6)')).toBe(
      'Costs 1 less for each card you played this turn and last (max 6)'
    );
    expect(softenBreaks('Whenever an enemy minion<br>takes damage, gain<br>+1 Attack this turn')).toBe(
      'Whenever an enemy minion takes damage, gain +1 Attack this turn'
    );
  });

  it('keeps a break after a keyword or a small line, and before one (CORE_101, PRIME_146)', () => {
    expect(softenBreaks('<strong>Destroy</strong><br>a minion<br><small>Removes it</small>')).toBe(
      '<strong>Destroy</strong><br>a minion<br><small>Removes it</small>'
    );
    expect(softenBreaks('<strong>Mystery</strong><br>When your opponent casts a<br>spell, add a copy')).toBe(
      '<strong>Mystery</strong><br>When your opponent casts a spell, add a copy'
    );
  });

  it('keeps a break after a finished sentence or clause, and before a keyword line (PRIME_141, PRIME_209)', () => {
    expect(softenBreaks('Whenever you cast a spell,<br>gain +1 Attack this turn;<br>draw a card at 4 Attack')).toBe(
      'Whenever you cast a spell, gain +1 Attack this turn;<br>draw a card at 4 Attack'
    );
    expect(softenBreaks('then disable any left with 1 Health<br><strong>Overload (2)</strong>')).toBe(
      'then disable any left with 1 Health<br><strong>Overload (2)</strong>'
    );
  });

  it('leaves text with no break alone', () => {
    expect(softenBreaks('Deal 2 damage')).toBe('Deal 2 damage');
    expect(softenBreaks('')).toBe('');
  });
});

describe('textLines', () => {
  it('splits parsed text into one group per line', () => {
    expect(textLines(parseRichText('<strong>Rush</strong><br>Go <small>now</small>'))).toEqual([
      [{ kind: 'strong', text: 'Rush' }],
      [{ kind: 'text', text: 'Go ' }, { kind: 'small', text: 'now' }],
    ]);
    expect(textLines(parseRichText('One line'))).toEqual([[{ kind: 'text', text: 'One line' }]]);
  });
});
