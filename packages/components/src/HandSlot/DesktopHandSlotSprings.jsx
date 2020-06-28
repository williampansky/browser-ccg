import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import clamp from 'lodash-es/clamp';
import styles from './styles.module.scss';
import { useGesture } from 'react-use-gesture';
import { useSpring, animated, config } from 'react-spring';
import { CardInteractionLayer } from '@ccg/components';

const DesktopHandSlot = props => {
  const {
    cardImageBaseSrc,
    cardImageFlairSrc,
    cardObject,
    cardUuid,
    handleCardInteractionClick,
    selectedCardUuid,
    slotIndex,
    isDesktop,
    isEnhanced,
    isPlayable
  } = props;

  const domTarget = useRef(null);

  const dragConfig = {
    enableDrag: true,
    enableScale: false,
    enableHover: true,
    enableRotation: false
  };

  const determineMouseCursor = useCallback((isDragging, isPlayable) => {
    if (!isPlayable) return 'default';
    return isDragging ? 'grabbing' : 'grab';
  }, []);

  const determineTransform = useCallback(
    (sc, rt, x, y) => {
      const { enableDrag, enableRotation, enableScale } = dragConfig;
      return `
        ${enableDrag ? `translate3d(${x}px, ${y}px, 0)` : ''}
        ${enableScale ? `scale(${sc})` : ''}
        ${enableRotation ? `rotate(${rt}deg)` : ''}
      `;
    },
    [dragConfig]
  );

  const fn = useCallback((isDown, isHovered, x, y) => {
    if (isDown) {
      return {
        x: x,
        y: y,
        scale: 1,
        rotate: 0,
        zIndex: 100,
        immediate: n => n === 'paddingBottom'
      };
    } else if (isHovered && !isDown && dragConfig.enableHover) {
      return {
        x: 0,
        y: -150,
        scale: 1,
        rotate: 0,
        zIndex: 100,
        immediate: n => {
          return n === 'x' || n === 'y' || n === 'scale' || n === 'zIndex';
        }
      };
    } else {
      return {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        zIndex: slotIndex * -1,
        immediate: n => n === 'zIndex'
      };
    }
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const [
    { paddingBottom, marginTop, rotate, scale, x, y, zIndex },
    setSprings
  ] = useSpring(() => fn(), {
    ...config.default,
    easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
  });

  const bind = useGesture(
    {
      onDrag: state => {
        const {
          active: isHovered,
          down: isDown,
          movement: [x, y]
        } = state;

        // console.log(vxvy);
        setSprings(fn(isDown, isHovered, x, y));
      }
      // onHover: state => {
      //   const {
      //     active: isHovered,
      //     delta: [x, y],
      //     down: isDown
      //   } = state;

      //   // console.log(state);
      //   setSprings(fn(isDown, isHovered, x, y));
      // }
    },
    {
      domTarget
    }
  );

  useEffect(bind, [bind]);

  return (
    <animated.div
      ref={domTarget}
      data-component="DesktopHandSlot"
      data-index={slotIndex}
      style={{
        cursor: determineMouseCursor(isDragging, isPlayable),
        // marginTop: marginTop.interpolate(mT => `${mT}px`),
        // paddingBottom: paddingBottom.interpolate(pB => `${pB}px`),
        position: 'absolute',
        pointerEvents: 'auto',
        x,
        y
      }}
    >
      <CardInteractionLayer
        card={cardObject}
        cardImageBaseSrc={cardImageBaseSrc}
        cardImageFlairSrc={cardImageFlairSrc}
        handleCardInteractionClick={handleCardInteractionClick}
        index={slotIndex}
        isPlayable={isPlayable}
        isSelected={selectedCardUuid === cardUuid ? true : false}
        isDesktop={isDesktop}
      />
    </animated.div>
  );
};

DesktopHandSlot.propTypes = {
  cardImageBaseSrc: PropTypes.string.isRequired,
  cardImageFlairSrc: PropTypes.string.isRequired,
  cardObject: PropTypes.object.isRequired,
  cardUuid: PropTypes.string.isRequired,
  handleCardInteractionClick: PropTypes.func,
  selectedCardUuid: PropTypes.string,
  slotIndex: PropTypes.number.isRequired,
  trayIsExpanded: PropTypes.bool,
  isDesktop: PropTypes.bool.isRequired,
  isEnhanced: PropTypes.bool.isRequired,
  isPlayable: PropTypes.bool.isRequired
};

DesktopHandSlot.defaultProps = {
  // handleCardInteractionClick: () => {
  //   console.error(
  //     'DesktopHandSlot: handleCardInteractionClick() provided as a defaultProp'
  //   );
  // },
  selectedCardUuid: null,
  trayIsExpanded: false,
  handleMouseEnter: () => {},
  handleMouseLeave: () => {}
};

export default DesktopHandSlot;
