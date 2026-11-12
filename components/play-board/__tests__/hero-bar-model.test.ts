import { energyPips, healthFraction, healthTone, weaponLabel } from '../hero-bar-model';

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

describe('weaponLabel', () => {
  it('drops the leading "Equip " from a weapon card name', () => {
    expect(weaponLabel('Equip Basic Mace')).toBe('Basic Mace');
    expect(weaponLabel("Equip Fisherman's Axe")).toBe("Fisherman's Axe");
  });
  it('leaves other names alone', () => {
    expect(weaponLabel('Gladius')).toBe('Gladius');
    expect(weaponLabel('Equipment Guard')).toBe('Equipment Guard');
    expect(weaponLabel('Equip')).toBe('Equip');
  });
});
