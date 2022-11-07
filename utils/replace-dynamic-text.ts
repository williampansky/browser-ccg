/**
 * Parses HTML and replaces the variable text symbol with the provided value.
 */
export default function replaceDynamicText(
  stringToParse: string,
  valuetoReplace1: string,
  valuetoReplace2: string
) {
  let newString = stringToParse;

  if (stringToParse.includes('%NUM2%')) {
    newString = stringToParse
      .replace(/%(NUM1)%/g, valuetoReplace1)
      .replace(/%(NUM2)%/g, valuetoReplace2);
  } else if (stringToParse.includes('%NUM1%')) {
    newString = stringToParse.replace(/%(NUM1)%/g, valuetoReplace1);
  } else {
    newString = stringToParse.replace(/%(NUM)%/g, valuetoReplace1);
  }

  return newString;
}
