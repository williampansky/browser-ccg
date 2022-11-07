/**
 * Removes the provided symbol from the provided string.
 */
export default function removeSymbols(string: string, symbol = /(%)/g) {
  try {
    return string.replace(symbol, '');
  } catch (error) {
    console.error(error);
  }
}
