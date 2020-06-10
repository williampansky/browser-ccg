import { ABILITIES } from '@ccg/data';
import { exists, replaceConstant } from '@ccg/utils';

/**
 * Returns the name of the provided parsed hero ability.
 * @param {String} symbol Symbol to match
 * @param {String} json ABILITIES.json
 */
export default function getHeroAbilityName(symbol, json = ABILITIES) {
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
