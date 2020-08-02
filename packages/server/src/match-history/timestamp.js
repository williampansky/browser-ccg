import { prefixWithZero } from '../utils/number-helpers';

const timestamp = () => {
  let dateObj = new Date();
  let hours = prefixWithZero(dateObj.getHours());
  let minutes = prefixWithZero(dateObj.getMinutes());
  let seconds = prefixWithZero(dateObj.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
};

export default timestamp;
