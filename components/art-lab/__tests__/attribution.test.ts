import { findAttribution } from '../attribution';

describe('findAttribution', () => {
  const rules = [
    { match: '^kenney/', artist: 'A' },
    { match: 'sword.*\\.png$', artist: 'B' },
    { match: '(', artist: 'bad' },
    { match: '.', artist: 'C' },
  ];

  it('first match wins, case-insensitive', () => {
    expect(findAttribution('Kenney/sword.png', rules)?.artist).toBe('A');
    expect(findAttribution('x/SWORD1.png', rules)?.artist).toBe('B');
  });

  it('accepts an array of regexes', () => {
    const r = [{ match: ['^a/', 'b\\.png$'], artist: 'X' }];
    expect(findAttribution('a/1.jpg', r)?.artist).toBe('X');
    expect(findAttribution('z/b.png', r)?.artist).toBe('X');
    expect(findAttribution('z/c.png', r)).toBeUndefined();
  });

  it('skips invalid regexes and returns undefined when nothing matches', () => {
    expect(findAttribution('zzz', rules)?.artist).toBe('C');
    expect(findAttribution('zzz', [])).toBeUndefined();
  });
});
