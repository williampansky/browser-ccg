import { CONSTANTS, MECHANICS } from '@ccg/data';
import { exists, replaceConstant } from '@ccg/utils';

/**
 * Returns the description of the provided parsed constant.
 * @param {String} symbol Symbol to match
 * @param {String} json CONSTANTS.json
 */
export default function getConstantDescription(symbol) {
  // eject if no symbol provided
  if (!exists(symbol)) return;

  // define spread data obj
  const json = { ...CONSTANTS, ...MECHANICS };

  // find matching object
  const match = json[symbol];
  if (!exists(match)) return;

  // desctructure nested prop
  const { description } = json[symbol];
  if (!exists(description)) return;

  // format description
  const result = replaceConstant(description);
  return result;
}
