// import { CONSTANTS, HEROS, MECHANICS } from '@ccg/data';
const json = {
  // ...CONSTANTS,
  // ...HEROS,
  // ...MECHANICS
} as any;

/**
 * Parses string and replaces the symbol with the relative constant.
 */
export default function replaceAllConstants(stringToParse: string) {
  return stringToParse.replace(/%(.*?)%/g, m => json[m] && json[m].name);
}
