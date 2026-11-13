import { energyPips, healthFraction, healthTone, pipsToSpend } from '../hero-bar-model';

describe('energyPips', () => {
  it('always shows ten slots', () => {
    expect(energyPips(0, 0)).toHaveLength(10);
    expect(energyPips(10, 10)).toHaveLength(10);
  });
  it('shows available, spent and locked slots in that order', () => {
    expect(energyPips(2, 4)).toEqual([
      'ready', 'ready', 'spent', 'spent', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked',
    ]);
  });
  it('shows a full turn start as all ready', () => {
    expect(energyPips(3, 3).filter((p) => p === 'ready')).toHaveLength(3);
    expect(energyPips(3, 3).filter((p) => p === 'spent')).toHaveLength(0);
  });
  it('shows extra energy beyond the unlocked slots as bonus slots (The Orb: 2/1)', () => {
    expect(energyPips(2, 1).slice(0, 3)).toEqual(['ready', 'bonus', 'locked']);
  });
  it('shows a spent-out turn as all spent', () => {
    expect(energyPips(0, 2).slice(0, 3)).toEqual(['spent', 'spent', 'locked']);
  });
});

describe('healthFraction and healthTone', () => {
  it('is a fraction of the maximum, clamped to 0..1', () => {
    expect(healthFraction(15, 30)).toBe(0.5);
    expect(healthFraction(-3, 30)).toBe(0);
    expect(healthFraction(99, 30)).toBe(1);
    expect(healthFraction(5, 0)).toBe(0);
  });
  it('defaults to the engine maximum health', () => {
    expect(healthFraction(30)).toBe(1);
  });
  it('bands green above half, amber above a quarter, red below', () => {
    expect(healthTone(1)).toBe('healthy');
    expect(healthTone(0.51)).toBe('healthy');
    expect(healthTone(0.5)).toBe('hurt');
    expect(healthTone(0.26)).toBe('hurt');
    expect(healthTone(0.25)).toBe('critical');
    expect(healthTone(0)).toBe('critical');
  });
});

describe('pipsToSpend', () => {
  const idx = (cur: number, total: number, cost: number) =>
    pipsToSpend(energyPips(cur, total), cost).flatMap((on, i) => (on ? [i] : []));
  it('marks the topmost available slots, as many as the cost', () => {
    expect(idx(5, 7, 2)).toEqual([3, 4]);
  });
  it('marks nothing for a free card', () => {
    expect(idx(5, 7, 0)).toEqual([]);
  });
  it('spends the bonus slot first (The Orb: 2/1)', () => {
    expect(idx(2, 1, 1)).toEqual([1]);
  });
  it('skips already spent slots', () => {
    expect(idx(2, 4, 1)).toEqual([1]);
  });
  it('marks every available slot when the card costs more than you have', () => {
    expect(idx(2, 4, 5)).toEqual([0, 1]);
  });
});
