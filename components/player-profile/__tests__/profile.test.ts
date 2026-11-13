import { cleanName, DEFAULT_NAME, DEFAULT_PROFILE, foeTheme, logName, MAX_NAME_LENGTH, normalizeProfile, themeOf, THEMES } from '../profile';

describe('cleanName', () => {
  it('trims, collapses spaces and keeps an ordinary name as it is', () => {
    expect(cleanName('  Ada   Lovelace ')).toBe('Ada Lovelace');
    expect(cleanName('Zoë ✨')).toBe('Zoë ✨');
  });
  it('removes control characters (a tab or newline becomes a space)', () => {
    expect(cleanName('a\tb\nc\u0000d')).toBe('a b c d');
  });
  it('cuts a long name at the limit, without a trailing space', () => {
    const long = cleanName('x'.repeat(50));
    expect(long).toHaveLength(MAX_NAME_LENGTH);
    expect(cleanName('abcdefghi jklmnopqrs tuv')).toBe('abcdefghi jklmnopqrs');
  });
  it('an empty, blank or non-text name becomes the default', () => {
    for (const v of ['', '   ', '\n\t', undefined, null, 5, {}]) expect(cleanName(v)).toBe(DEFAULT_NAME);
  });
  it('shows markup-looking text as plain text (React escapes it; nothing is parsed)', () => {
    expect(cleanName('<b>hi</b>')).toBe('<b>hi</b>');
  });
});

describe('normalizeProfile', () => {
  it('keeps a good profile', () => expect(normalizeProfile({ name: 'Ada', theme: 'purple' })).toEqual({ name: 'Ada', theme: 'purple' }));
  it('falls back field by field for anything bad, missing or old', () => {
    expect(normalizeProfile(null)).toEqual(DEFAULT_PROFILE);
    expect(normalizeProfile('nope')).toEqual(DEFAULT_PROFILE);
    expect(normalizeProfile({ name: 'Ada' })).toEqual({ name: 'Ada', theme: 'green' });
    expect(normalizeProfile({ name: '  ', theme: 'chartreuse' })).toEqual(DEFAULT_PROFILE);
  });
});

describe('themes', () => {
  it('every theme has a distinct id and colour', () => {
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
    expect(new Set(THEMES.map((t) => t.color)).size).toBe(THEMES.length);
    for (const t of THEMES) expect(t.color).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('an unknown theme is the first (green)', () => expect(themeOf('zzz').id).toBe('green'));
  it('the opponent is red, or blue when you are red: never your own colour', () => {
    for (const t of THEMES) expect(foeTheme(t.id).id).not.toBe(t.id);
    expect(foeTheme('green').id).toBe('red');
    expect(foeTheme('red').id).toBe('blue');
  });
});

describe('logName', () => {
  it('shows your name for Player 1 and leaves everything else alone', () => {
    expect(logName('Player 1', 'Ada')).toBe('Ada');
    expect(logName('Player 2', 'Ada')).toBe('Player 2');
  });
});
