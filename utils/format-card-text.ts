import { add } from 'mathjs';
import { replaceAllConstants, replaceDynamicText } from './'

export default function formatCardText(
  string = '',
  numPrimary = 0,
  numSecondary = 0,
  numRng = 0,
  spellDmgBoon = 0
) {
  const PRIMARY = add(numPrimary, spellDmgBoon);
  const SECONDARY = add(numSecondary, spellDmgBoon);
  const RNG = add(numRng, spellDmgBoon);

  const replacedDynamicDmg = replaceDynamicText(string, PRIMARY, SECONDARY, RNG);
  const replacedSymbols = replaceAllConstants(replacedDynamicDmg);

  return replacedSymbols;
}
