/**
 * Returns an integer no more than MAX and no less than MIN.
 *
 * @param {Number} number Either an integer or an expression
 * @param {Number} max Max amount
 * @param {Number} min Min amount
 * @see https://stackoverflow.com/a/5842770/8296677
 */
const limitNumberWithinRange = (number: number, max: number, min: number) => {
  const MIN = min || 0;
  const MAX = max || 0;
  return Math.min(Math.max(number, MIN), MAX);
};

export default limitNumberWithinRange;
