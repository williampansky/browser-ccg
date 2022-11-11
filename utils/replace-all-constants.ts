import CONSTANTS from '../data/constants.json';
import MECHANICS from '../data/mechanics.json';

const json = {
  ...CONSTANTS,
  ...MECHANICS
  // ...HEROS,
} as any;

/**
 * Parses string and replaces the symbol with the relative constant.
 */
export default function replaceAllConstants(stringToParse: string) {
  return stringToParse.replace(/%(.*?)%/g, x => json[x] && json[x].name);
}
