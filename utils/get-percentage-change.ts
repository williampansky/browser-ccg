import { subtract } from "mathjs";

/**
 * Returns the percentange change between 2 numbers.
 * e.g from 1000 to 500 = 50%
 */
export default function getPercentageChange(
  oldNumber: number,
  newNumber: number
) {
  const decreaseValue = subtract(oldNumber, newNumber);
  return (decreaseValue / oldNumber) * 100;
}
