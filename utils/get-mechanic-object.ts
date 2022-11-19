import MECHANICS from '../data/mechanics.json';
import { Mechanic } from '../types';

/**
 * Returns the description of the provided parsed constant.
 */
const getMechanicObject = (key: string): Mechanic => {
  const json: Record<string, any> = MECHANICS;
  return json[`%${key}%`];
};

export default getMechanicObject;
