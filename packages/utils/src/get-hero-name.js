import { HEROS } from '@ccg/data';
import { exists, replaceConstant } from '@ccg/utils';

/**
 * Returns the name of the provided parsed hero symbol.
 * @param {String} symbol Symbol to match
 * @param {String} json HEROS.json
 */
export default function getHeroName(symbol, json = HEROS) {
  // eject if no symbol provided
  if (!exists(symbol)) return;

  // find matching object
  const match = json[symbol];
  if (!exists(match)) return;

  // desctructure nested prop
  const { name } = json[symbol];
  if (!exists(name)) return;

  // return string
  return replaceConstant(name);
}
