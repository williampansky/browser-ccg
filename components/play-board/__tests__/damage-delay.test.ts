import { loadDelayDamage, saveDelayDamage } from '../damage-delay';

describe('damage delay setting', () => {
  beforeEach(() => window.localStorage.clear());

  it('is on until the player turns it off', () => {
    expect(loadDelayDamage()).toBe(true);
    saveDelayDamage(false);
    expect(loadDelayDamage()).toBe(false);
    saveDelayDamage(true);
    expect(loadDelayDamage()).toBe(true);
  });
});
