/**
 * Prefixes a single-digit number with a leading zero.
 * @param {String} string String to prefix
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
 */
export const prefixWithZero = string => {
  string = string.toString();
  return string.padStart(2, '0');
};
