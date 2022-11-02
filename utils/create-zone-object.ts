import { v4 as uuid } from 'uuid';
import { Zone, ZoneBase } from '../types';

/**
 * Creates a `Zone` object from the provided zone base info. Can
 * be create with or without a uuid() via the second param.
 */
const createZoneObject = (obj: ZoneBase, withUuid: boolean = false): Zone => {
  const { id, name, effectAdjustment, effectText } = obj;

  return {
    disabled: {
      '0': false,
      '1': false,
    },
    id: id,
    name: name,
    powers: {
      '0': 0,
      '1': 0,
    },
    effectAdjustment: effectAdjustment,
    effectText: effectText,
    revealed: false,
    sides: {
      '0': [],
      '1': [],
    },
    uuid: withUuid ? uuid() : '',
  } as Zone;
};

export default createZoneObject;
