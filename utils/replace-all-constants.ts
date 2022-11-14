import CONSTANTS from '../data/constants.json';
import MECHANICS from '../data/mechanics.json';

const jsonDatabase = {
  ...CONSTANTS,
  ...MECHANICS,
  // ...HEROS,
} as any;

/**
 * Parses string and replaces the symbol with the relative constant.
 */
export default function replaceAllConstants(
  stringToParse: string,
  keyToUse: string = 'name'
) {
  if (!stringToParse) return;
  return stringToParse.replace(
    /%(.*?)%/g,
    (x) => jsonDatabase[x] && jsonDatabase[x][keyToUse]
  );
}
