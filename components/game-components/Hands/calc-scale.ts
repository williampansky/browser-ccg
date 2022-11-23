const mobile = (total: number) => {
  let scale = 0.565;

  // prettier-ignore
  switch (total) {
    case 1:   return scale * 1.65;
    case 2:   return scale * 1.5;
    case 3:   return scale * 1.35;
    case 4:   return scale * 1.25;
    case 5:   return scale * 1.15;
    case 6:   return scale * 1.05;
    case 7:   return scale * 0.95;
    case 8:   return scale * 0.85;
    case 9:   return scale * 0.75;
    case 10:  return scale * 0.65;
    default:  return scale;
  }
};

const desktop = (total: number) => {
  let scale = 0.865;

  // prettier-ignore
  switch (total) {
    case 1:   return scale * 1.65;
    case 2:   return scale * 1.5;
    case 3:   return scale * 1.35;
    case 4:   return scale * 1.25;
    case 5:   return scale * 1.15;
    case 6:   return scale * 1.05;
    case 7:   return scale * 0.95;
    case 8:   return scale * 0.85;
    case 9:   return scale * 0.75;
    case 10:  return scale * 0.65;
    default:  return scale;
  }
};

const calcScale = (
  total: number,
  windowWidth: number
): number => {
  if (windowWidth >= 1024) {
    return desktop(total);
  }

  return mobile(total);
};

export default calcScale;
