/**
 * Parses HTML and replaces the variable text symbol with the provided value.
 */
export default function replaceDynamicText(
  stringToParse: string,
  valuetoReplace1: number,
  valuetoReplace2: number,
  valuetoReplace3: number
) {
  const val1 = valuetoReplace1.toString();
  const val2 = valuetoReplace2.toString();
  const val3 = valuetoReplace3.toString();

  return stringToParse
    .replace(/%(NUM1)%/g, val1)
    .replace(/%(NUM1)%/g, val1)
    .replace(/%(NUM2)%/g, val2)
    .replace(/%(RNG)%/g, val3);
}
