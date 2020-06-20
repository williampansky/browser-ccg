import { replaceConstant } from '@ccg/utils';

/**
 * Returns minion race in lower case format
 * @param {string} race
 */
export default function getMinionRaceClass(race) {
  if (!race) return;
  return `minion__race--${replaceConstant(race).toLowerCase()}`;
}
