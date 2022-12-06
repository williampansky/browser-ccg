import calcOffsetX from './calc-offset-x';
import calcScale from './calc-scale';
import { config as springConfig, easings } from 'react-spring';

/**
 * Returns fitting styles for dragged/idle items
 */
const fn =
  (
    items: number = 0,
    windowWidth: number = 0,
    isDown: any = false,
    isDragging: any = false,
    isHovered: any = false,
    curIndex: any = 0,
    x: any = 0,
    y: any = 0
  ) =>
  (index: number) => {
    const logMatch = false;
    const disableRotation = false;
    const match = curIndex === index;
    const nextMatch = curIndex === index + 1;
    const prevMatch = curIndex === index - 1;
    const gtMatch = curIndex > index;
    const ltMatch = curIndex < index;
    const hoverOffsetY = -90;

    if (match && logMatch)
      console.log(
        `isDown:(${isDown}), isHovered:(${isHovered}), xy:(${x},${y})`
      );

    const context = () => {
      if (isDown || isDragging) return 'isDown';
      else if (isHovered && !isDragging) return 'isHovered';
      return 'none';
    };

    if (context() === 'isDown' && match)
      return {
        x: x,
        y: y + (hoverOffsetY / 2),
        rotate: 0,
        scale: 1.465,
        marginTop: 0,
        zIndex: 100,
        cursor: 'grabbing',
        immediate: (n: string) => n === 'x' || n === 'y' || n === 'scale' || n === 'zIndex',
        config: {
          ...springConfig.default,
          easing: easings.easeInOutQuart
        },
      };
    else if (context() === 'isHovered' && match)
      return {
        display: 'none', // disables hidden hover listener div
        x: 0,
        y: hoverOffsetY,
        rotate: 0,
        scale: 2,
        marginTop: 0,
        zIndex: 100,
        cursor: 'grab',
        immediate: true,
        config: {
          ...springConfig.default,
          tension: 500,
          friction: 38,
          duration: 75,
          easing: easings.easeInOutQuart
        },
      };
    else
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: calcScale(items, windowWidth),
        marginLeft: calcOffsetX(index, items, windowWidth),
        marginTop: 0,
        zIndex: index * 1,
        cursor: 'grab',
        display: 'block',
        // immediate: (n: string) => n === 'zIndex',
        immediate: false,
        config: {
          ...springConfig.default,
          easing: easings.easeInOutQuart
        },
      };
  };

export default fn;
