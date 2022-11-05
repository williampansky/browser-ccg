const calcOffsetX = (index: number, total: number) => {
  let calc = 50;

  if (total === 2) {
    if (index === 0) return -calc;
    if (index === 1) return calc;
  }

  if (total === 3) {
    calc = 115;
    if (index === 0) return -calc;
    if (index === 1) return 0;
    if (index === 2) return calc;
  }

  if (total === 4) {
    calc = 40;
    if (index === 0) return calc - 105 - 100;
    if (index === 1) return calc - 105;
    if (index === 2) return calc;
    if (index === 3) return calc + 100;
  }

  if (total === 5) {
    calc = 100;
    if (index === 0) return -200;
    if (index === 1) return -100;
    if (index === 2) return 0;
    if (index === 3) return 100;
    if (index === 4) return 200;
  }

  if (total === 6) {
    if (index === 0) return index - 200;
    if (index === 1) return index - 120;
    if (index === 2) return index - 40;
    if (index === 3) return index + 40;
    if (index === 4) return index + 120;
    if (index === 5) return index + 200;
  }

  if (total === 7) {
    if (index === 0) return index - 200;
    if (index === 1) return index - 132;
    if (index === 2) return index - 64;
    if (index === 3) return 0;
    if (index === 4) return index + 70;
    if (index === 5) return index + 136.5;
    if (index === 6) return index + 204;
  }

  if (total === 8) {
    calc = 30;
    if (index === 0) return calc * -7;
    if (index === 1) return calc * -5;
    if (index === 2) return calc * -3;
    if (index === 3) return -calc;
    if (index === 4) return calc;
    if (index === 5) return calc * 3;
    if (index === 6) return calc * 5;
    if (index === 7) return calc * 7;
  }

  return index * -85;
  // return calc;
};

export default calcOffsetX;
