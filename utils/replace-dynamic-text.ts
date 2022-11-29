/**
 * Parses HTML and replaces the variable text symbol with the provided value.
 */
export default function replaceDynamicText(
  stringToParse: string,
  valuetoReplace1: number,
  valuetoReplace2: number,
  valuetoReplace3: number,
) {
  const val1 = valuetoReplace1.toString();
  const val2 = valuetoReplace2.toString();
  const val3 = valuetoReplace3.toString();

  // prettier-ignore
  if (stringToParse.includes('%NUM2%')) {
    return stringToParse
      .replace(/%(NUM1)%/g, val1)
      .replace(/%(NUM2)%/g, val2);
  }

  if (stringToParse.includes('%NUM1%')) {
    console.log(stringToParse, val1)
    return stringToParse.replace(/%(NUM1)%/g, val1);
  }
  
  if (stringToParse.includes('%RNG%')) {
    return stringToParse.replace(/%(RNG)%/g, val3);
  }

  return stringToParse.replace(/%(NUM)%/g, val1);
}
