import { Zone } from '../../types';
import createZoneObject from '../create-zone-object';
import getGameResult from '../get-game-result';

describe('Gets game victory by PlayerID or draw', () => {
  const testZoneObj = createZoneObject({ id: 'testZone', name: 'Test Zone' });

  test('Should return "0" if game is won by Player 0 by number of Zones', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = getGameResult(zones);
    expect(fn).toEqual('0');
  });

  test('Should return "0" if game is won by Player 0 by total power', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 10, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 2 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = getGameResult(zones);
    expect(fn).toEqual('0');
  });

  test('Should return "1" if game is won by Player 1 by number of Zones', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 1, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 0 }},
      { ...testZoneObj, powers: { '0': 2, '1': 3 }}
    ] as Zone[];

    const fn = getGameResult(zones);
    expect(fn).toEqual('1');
  });

  test('Should return "1" if game is won by Player 1 by total power', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 0, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 2 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = getGameResult(zones);
    expect(fn).toEqual('1');
  });

  test('Should return draw (empty string) if there is no game winner', () => {
    // prettier-ignore
    const zones = [
      { ...testZoneObj, powers: { '0': 4, '1': 4 }},
      { ...testZoneObj, powers: { '0': 2, '1': 2 }},
      { ...testZoneObj, powers: { '0': 3, '1': 3 }}
    ] as Zone[];

    const fn = getGameResult(zones);
    expect(fn).toEqual('');
  });
});
