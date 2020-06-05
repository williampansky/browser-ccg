export function getLengthOfString(string) {
  const regEx = /[a-z]/gi;
  const match = string.match(regEx);
  return match ? match.length : undefined;
}

export function fontSizeBasedOnCharacterLength(phrase) {
  const length = getLengthOfString(phrase);
  let size = 1;

  if (length) {
    if (length > 30) size = 0.725;
    else if (length > 25) size = 0.765;
    else if (length > 20) size = 0.8245;
    else if (length > 15) size = 0.875;
    else if (length > 10) size = 0.9625;
    else if (length > 6) size = 1.125;
    else if (length > 4) size = 1.25;
    else size = 1;
  }

  return size;
}
