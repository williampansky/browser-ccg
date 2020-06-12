/**
 * Calculates in percent, the change between 2 numbers.
 * e.g from 1000 to 500 = 50%
 *
 * @param {number} oldNumber The initial value
 * @param {number} newNumber The value that changed
 */
export default function getPercentageChange(oldNumber, newNumber) {
  const decreaseValue = parseInt(oldNumber - newNumber);
  return (decreaseValue / oldNumber) * 100;
}
