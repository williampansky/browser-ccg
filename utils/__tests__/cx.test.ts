import { cx } from '../index';

describe('cx', () => {
  it('joins class names with single spaces', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c');
  });
  it('leaves out false, null, undefined and empty strings', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
  });
  it('takes an inline condition', () => {
    const loss = true;
    expect(cx('over', loss && 'loss')).toBe('over loss');
    expect(cx('over', !loss && 'loss')).toBe('over');
  });
  it('returns an empty string when nothing is left', () => {
    expect(cx()).toBe('');
    expect(cx(false, undefined)).toBe('');
  });
});
