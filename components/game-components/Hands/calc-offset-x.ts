const mobile = (index: number, total: number): number => {
  let calc = 140;

  if (total === 2) {
    if (index === 0) return calc * -0.7125;
    if (index === 1) return calc * 0.5;
  }

  if (total === 3) {
    if (index === 0) return -calc;
    if (index === 1) return 0;
    if (index === 2) return calc;
  }

  if (total === 4) {
    let calc = 70;
    if (index === 0) return calc * -3;
    if (index === 1) return calc * -1;
    if (index === 2) return calc * 1;
    if (index === 3) return calc * 3;
  }

  if (total === 5) {
    calc = 78;
    if (index === 0) return calc * -3.35;
    if (index === 1) return calc * -1.7;
    if (index === 2) return 0;
    if (index === 3) return calc * 1.7;
    if (index === 4) return calc * 3.35;
  }

  if (total === 6) {
    calc = 72;
    if (index === 0) return calc * -3.75;
    if (index === 1) return calc * -2.25;
    if (index === 2) return calc * -0.75;
    if (index === 3) return calc * 0.75;
    if (index === 4) return calc * 2.25;
    if (index === 5) return calc * 3.75;
  }

  if (total === 7) {
    calc = 64;
    if (index === 0) return calc * -4.75;
    if (index === 1) return calc * -3.15;
    if (index === 2) return calc * -1.55;
    if (index === 3) return 0;
    if (index === 4) return calc * 1.55;
    if (index === 5) return calc * 3.15;
    if (index === 6) return calc * 4.75;
  }

  if (total === 8) {
    calc = 50;
    if (index === 0) return calc * -6.25;
    if (index === 1) return calc * -4.485;
    if (index === 2) return calc * -2.7;
    if (index === 3) return -calc + 5;
    if (index === 4) return calc -5;
    if (index === 5) return calc * 2.7;
    if (index === 6) return calc * 4.485;
    if (index === 7) return calc * 6.25;
  }

  if (total === 9) {
    calc = 30;
    if (index === 0) return calc * -10;
    if (index === 1) return calc * -7.5;
    if (index === 2) return calc * -5;
    if (index === 3) return calc * -2.5;
    if (index === 4) return 0;
    if (index === 5) return calc * 2.5;
    if (index === 6) return calc * 5;
    if (index === 7) return calc * 7.5;
    if (index === 8) return calc * 10;
  }

  if (total === 10) {
    calc = 35;
    if (index === 0) return calc * -9;
    if (index === 1) return calc * -7;
    if (index === 2) return calc * -5;
    if (index === 3) return calc * -3;
    if (index === 4) return -calc;
    if (index === 5) return calc;
    if (index === 6) return calc * 3;
    if (index === 7) return calc * 5;
    if (index === 8) return calc * 7;
    if (index === 9) return calc * 9;
  }

  return index * -85;
};

const desktop = (index: number, total: number): number => {
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
    calc = 0;
    if (index === 0) return calc - 220;
    if (index === 1) return calc - 75;
    if (index === 2) return calc + 75;
    if (index === 3) return calc + 220;
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

  if (total === 9) {
    calc = 30;
    if (index === 0) return calc * -8;
    if (index === 1) return calc * -6;
    if (index === 2) return calc * -4;
    if (index === 3) return calc * -2;
    if (index === 4) return 0;
    if (index === 5) return calc * 2;
    if (index === 6) return calc * 4;
    if (index === 7) return calc * 6;
    if (index === 8) return calc * 8;
  }

  if (total === 10) {
    calc = 25;
    if (index === 0) return calc * -9;
    if (index === 1) return calc * -7;
    if (index === 2) return calc * -5;
    if (index === 3) return calc * -3;
    if (index === 4) return -calc;
    if (index === 5) return calc;
    if (index === 6) return calc * 3;
    if (index === 7) return calc * 5;
    if (index === 8) return calc * 7;
    if (index === 9) return calc * 9;
  }

  return index * -85;
};

const calcOffsetX = (
  index: number,
  total: number,
  windowWidth: number
): number => {
  if (windowWidth >= 1024) {
    return desktop(index, total);
  }

  return mobile(index, total);
};

export default calcOffsetX;
