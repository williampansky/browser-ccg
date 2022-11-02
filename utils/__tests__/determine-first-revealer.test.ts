import 'jest-matcher-one-of';
import { Zone } from '../../types';
import createZoneObject from '../create-zone-object';
import determineFirstRevealer from '../determine-first-revealer';

describe('Determines which player\'s cards should reveal first', () => {
  const testZoneObj = createZoneObject({ id: 'testZone', name: 'Test Zone' });

  test('Should return "0" if Player 0 has more Zones won', () => {
    // prettier-ignore
    const Zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = determineFirstRevealer(Zones);
    expect(fn).toEqual('0');
  });

  test('Should return "0" if Player 0 has more power while Zones tied', () => {
    // prettier-ignore
    const Zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 2 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = determineFirstRevealer(Zones);
    expect(fn).toEqual('0');
  });

  test('Should return "1" or "0" no result is achieved', () => {
    // prettier-ignore
    const Zones = [
      { ...testZoneObj, powers: { '0': 4, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 2 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    expect(determineFirstRevealer(Zones)).toBeOneOf(['0', '1']);
    expect(determineFirstRevealer(Zones)).toBeOneOf(['0', '1']);
    expect(determineFirstRevealer(Zones)).toBeOneOf(['0', '1']);
    expect(determineFirstRevealer(Zones)).toBeOneOf(['0', '1']);
  });

  test('Should return "1" or "0" no Zones are provided', () => {
    expect(determineFirstRevealer()).toBeOneOf(['0', '1']);
    expect(determineFirstRevealer()).toBeOneOf(['0', '1']);
    expect(determineFirstRevealer()).toBeOneOf(['0', '1']);
    expect(determineFirstRevealer()).toBeOneOf(['0', '1']);
  });
});
