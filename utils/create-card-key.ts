import { v4 as uuid } from 'uuid';
import replaceAllConstants from './replace-all-constants';

/**
 * Creates a unique key identifier to fulfill the `Card.key` requirement.
 * Note that this is not the same as `Card.uuid`—which is intended for
 * in-match server mechanics.
 */
const createCardKey = (id?: string, set?: string): string => {
  return set && id ? `${replaceAllConstants(set, 'value')}_${id}` : uuid();
};

export default createCardKey;
