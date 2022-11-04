const calcScale = (total: number) => {
  let scale = 0.565;

  // prettier-ignore
  switch (total) {
    case 2:   return scale * 1.5;
    case 3:   return scale * 1.35;
    case 4:   return scale * 1.25;
    case 5:   return scale * 1.15;
    case 6:   return scale * 1.05;
    case 7:   return scale * 0.95;
    default:  return scale;
  }
};

export default calcScale;
