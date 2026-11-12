import { isAccessible, setAccessible, titleIf } from '../accessibility';

describe('accessibility mode', () => {
  beforeEach(() => window.localStorage.clear());

  it('is off by default and remembers the choice', () => {
    expect(isAccessible()).toBe(false);
    setAccessible(true);
    expect(isAccessible()).toBe(true);
    setAccessible(false);
    expect(isAccessible()).toBe(false);
  });

  it('only gives a title in accessibility mode', () => {
    expect(titleIf(false, 'Cards in hand')).toBeUndefined();
    expect(titleIf(true, 'Cards in hand')).toBe('Cards in hand');
  });
});
