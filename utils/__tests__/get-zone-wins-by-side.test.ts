import { Zone } from '../../types';
import createZoneObject from '../create-zone-object';
import getZonesWonBySide from '../get-zone-wins-by-side';

describe('Gets the number of Zones won per player', () => {
  const testZoneObj = createZoneObject({ id: 'testZone', name: 'Test Zone' });

  test('Should return 3/0 with all sides won by player 0', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 3, '1': -2 }}
    ] as Zone[];

    const fn = getZonesWonBySide(zones);
    expect(fn).toEqual({ '0': 3, '1': 0 });
  });

  test('Should return 2/1 with no zone power ties', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 6 }},
      { ...testZoneObj, powers: { '0': 3, '1': -2 }}
    ] as Zone[];

    const fn = getZonesWonBySide(zones);
    expect(fn).toEqual({ '0': 2, '1': 1 });
  });

  test('Should return 1/1 with one zone power tied', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 4 }},
      { ...testZoneObj, powers: { '0': 8, '1': 12 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = getZonesWonBySide(zones);
    expect(fn).toEqual({ '0': 1, '1': 1 });
  });

  test('Should return 0/0 with all Zones tied by both players', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 10 }},
      { ...testZoneObj, powers: { '0': 12, '1': 12 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = getZonesWonBySide(zones);
    expect(fn).toEqual({ '0': 0, '1': 0 });
  });
});
