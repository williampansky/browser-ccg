import { MECHANICS } from '@ccg/data';
import { exists } from '@ccg/utils';

/**
 * Returns the shortDescription of the provided parsed constant.
 * @param {String} symbol Symbol to match
 * @param {String} json MECHANICS.json
 */
export default function getMechanicShortDescription(symbol, json = MECHANICS) {
  // eject if no symbol provided
  if (!exists(symbol)) return;

  // find matching object
  const match = json[symbol];
  if (!exists(match)) return;

  // desctructure nested prop
  const { shortDescription } = json[symbol];
  if (!exists(shortDescription)) return;

  // return string
  return shortDescription;
}
