import CONSTANTS from '../data/constants.json';
import MECHANICS from '../data/mechanics.json';

const jsonDatabase = {
  ...CONSTANTS,
  ...MECHANICS,
  // ...HEROS,
} as any;

/**
 * Parses string and replaces the symbol (%) with the relative constant.
 * @example replaceAllConstants('%RARITY_COMMON%') => 'Common';
 * @example replaceAllConstants('%RARITY_COMMON%', 'value') => 'COMMON';
 */
const replaceAllConstants = (
  stringToParse: string,
  keyToUse: 'name' | 'value' = 'name'
) => {
  // eject if no param or param is undefined
  if (!stringToParse || typeof stringToParse === undefined) return '';

  // used json to match the replacement by keyToUse
  return stringToParse.replace(
    /%(.*?)%/g,
    (x) => jsonDatabase[x] && jsonDatabase[x][keyToUse]
  );
};

export default replaceAllConstants;
