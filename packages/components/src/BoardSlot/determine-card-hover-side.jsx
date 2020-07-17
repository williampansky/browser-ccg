/**
 *
 */
const determineCardHoverSide = (boardLength, currentIndex) => {
  const left = 'left';
  const right = 'right';

  switch (boardLength) {
    case 4:
      if (currentIndex === 3) return left;
      return right;
    case 5:
      if (currentIndex === 3 || currentIndex === 4) return left;
      return right;
    case 6:
      if (currentIndex === 4 || currentIndex === 5) return left;
      return right;
    case 7:
      if (currentIndex === 5 || currentIndex === 6) return left;
      return right;
    default:
      return right;
  }
};

export default determineCardHoverSide;
