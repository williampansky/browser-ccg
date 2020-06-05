import { exists } from '@ccg/utils';

/**
 * Parses HTML and replaces the variable text symbol with the provided value.
 * @param {String} string HTML string to parse
 * @param {String} value1 Value to replace
 * @param {String} value2 Value to replace
 */
export default function replaceDynamicText(string, value1, value2) {
  let newString = string;
  if (!exists(string) || !exists(value1) || !exists(value2)) return string;

  if (string.includes('%NUM2%')) {
    newString = string
      .replace(/%(NUM1)%/g, value1)
      .replace(/%(NUM2)%/g, value2);
  } else if (string.includes('%NUM1%')) {
    newString = string.replace(/%(NUM1)%/g, value1);
  } else {
    newString = string.replace(/%(NUM)%/g, value1);
  }

  return newString;
}
