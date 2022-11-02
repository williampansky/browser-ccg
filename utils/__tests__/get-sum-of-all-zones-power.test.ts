import { Zone } from '../../types';
import createZoneObject from '../create-zone-object';
import getSumOfAllZonesPower from '../get-sum-of-all-zones-power';

describe('Total power calculations for the given PlayerID', () => {
  const testZoneObj = createZoneObject({ id: 'testZone', name: 'Test Zone' });
  test('Total from all-positive zone powers', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 2, '1': 0 }}
    ] as Zone[];

    const fn = getSumOfAllZonesPower(zones, '0');
    expect(fn).toEqual(6);
  });

  test('Total from all-negative zone powers', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': -2, '1': 0 }},
      { ...testZoneObj, powers: { '0': -2, '1': 0 }},
      { ...testZoneObj, powers: { '0': -2, '1': 0 }}
    ] as Zone[];

    const fn = getSumOfAllZonesPower(zones, '0');
    expect(fn).toEqual(-6);
  });

  test('Mixed positive and negative zone powers', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': -2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 2, '1': 0 }}
    ] as Zone[];

    const fn = getSumOfAllZonesPower(zones, '0');
    expect(fn).toEqual(2);
  });

  test('Mixed positive, negative, and zero zone powers', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': -2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 0, '1': 0 }}
    ] as Zone[];

    const fn = getSumOfAllZonesPower(zones, '0');
    expect(fn).toEqual(0);
  });
});
