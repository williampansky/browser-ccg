import { ABILITIES } from '@ccg/data';
import { exists } from '@ccg/utils';

/**
 * Returns the text of the provided parsed hero ability.
 * @param {String} symbol Symbol to match
 * @param {String} json ABILITIES.json
 */
export default function getHeroAbilityText(symbol, json = ABILITIES) {
  // eject if no symbol provided
  if (!exists(symbol)) return;

  // find matching object
  const match = json[symbol];
  if (!exists(match)) return;

  // desctructure nested prop
  const { text } = json[symbol];
  if (!exists(text)) return;

  // return string
  return text;
}
