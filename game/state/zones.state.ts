import { gameConfig } from '../../app.config';
import { GameState, PlayerID, Zone, ZoneBase } from '../../types';
import zonesDatabase from '../data/zones.json';
import createZoneObject from '../../utils/create-zone-object';
import getRandomNumberBetween from '../../utils/get-random-number-between';

const zones = {
  defaultState: [
    ...Array.from(Array(gameConfig.numerics.numberOfZones)).map(() => {
      return createZoneObject({
        id: '',
        name: '',
      });
    }),
  ] as Zone[],

  create: (zoneBase: ZoneBase, withUuid: boolean): Zone => {
    return createZoneObject(zoneBase, withUuid);
  },

  createRandom: (): Zone => {
    const db = zonesDatabase;
    const randomZone = db[getRandomNumberBetween(0, db.length)];
    return createZoneObject(randomZone, true);
  },

  set: (G: GameState, zonesArray: Zone[]): void => {
    G.zones = zonesArray;
  },

  setZone: (G: GameState, zoneNumber: number, zoneObj: Zone): void => {
    G.zones[zoneNumber] = zoneObj;
  },

  disableZone: (G: GameState, zoneNumber: number, player?: PlayerID): void => {
    if (player) {
      G.zones[zoneNumber].disabled[player] = true;
    } else {
      G.zones[zoneNumber].disabled = {
        '0': true,
        '1': true,
      };
    }
  },

  areReady: (G: GameState): boolean => {
    return (
      G.zones[0].uuid !== '' && G.zones[1].uuid !== '' && G.zones[2].uuid !== ''
    );
  },
};

export default zones;
