import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { AppIcon, HandSlot } from '@ccg/components';
import clamp from 'lodash-es/clamp';
import { useGesture } from 'react-use-gesture';
import { useSprings, animated, config, interpolate } from 'react-spring';

// document.addEventListener('gesturestart', e => e.preventDefault());
// document.addEventListener('gesturechange', e => e.preventDefault());

const DesktopHand = props => {
  const {
    cardsInHand: items,
    deselectCardFunction,
    handleCardInteractionClick,
    selectedCardObject,
    selectedCardUuid,
    isDesktop
  } = props;

  // Store indicies as a local ref, this represents the item order
  const order = useRef(items.map((_, index) => index));

  // Returns fitting styles for dragged/idle items
  const fn = (isDown, isDragging, isHovered, curIndex, x, y) => index => {
    const logMatch = false;
    const match = curIndex === index;
    const nextMatch = curIndex === index + 1;
    const prevMatch = curIndex === index - 1;
    const gtMatch = curIndex > index;
    const ltMatch = index < index;
    const hoverOffsetY = -150;

    if (match && logMatch)
      console.log(
        `isDown:(${isDown}), isHovered:(${isHovered}), xy:(${x},${y})`
      );

    const calcOffsetX = (index, total = items.length) => {
      let calc = 50;

      if (total === 2) {
        if (index === 0) return calc;
        if (index === 1) return -calc;
      }

      if (total === 3) {
        calc = 115;
        if (index === 0) return calc;
        if (index === 1) return 0;
        if (index === 2) return -calc;
      }

      if (total === 4) {
        calc = 40;
        if (index === 0) return calc + 100;
        if (index === 1) return calc;
        if (index === 2) return calc - 105;
        if (index === 3) return calc - 105 - 100;
      }

      if (total === 5) {
        calc = 100;
        if (index === 0) return 200;
        if (index === 1) return 100;
        if (index === 2) return 0;
        if (index === 3) return -100;
        if (index === 4) return -200;
      }

      if (total === 6) {
        if (index === 0) return index + 200;
        if (index === 1) return index + 120;
        if (index === 2) return index + 40;
        if (index === 3) return index - 40;
        if (index === 4) return index - 120;
        if (index === 5) return index - 200;
      }

      if (total === 7) {
        if (index === 0) return index + 274;
        if (index === 1) return index + 180;
        if (index === 2) return index + 86;
        if (index === 3) return 0;
        if (index === 4) return index - 86;
        if (index === 5) return index - 120;
        if (index === 6) return index - 184;
      }

      if (total === 8) {
        if (index === 0) return index + 300;
        if (index === 1) return index + 200;
        if (index === 2) return index + 100;
        if (index === 3) return 0;
        if (index === 4) return index - 100;
        if (index === 5) return index - 200;
        if (index === 6) return index - 300;
        if (index === 7) return index - 300;
      }

      return index * -85;
    };

    const calcOffsetY = (index, total = items.length) => {
      if (total === 1 || total === 2) return 0;

      if (total === 3) {
        if (index === 0) return index + 10;
        if (index === 1) return 0;
        if (index === 2) return index + 10;
      }

      if (total === 4) {
        if (index === 0) return index + 10;
        if (index === 1) return 0;
        if (index === 2) return 0;
        if (index === 3) return index + 10;
      }

      if (total === 5) {
        if (index === 0) return 10;
        if (index === 1) return -10;
        if (index === 2) return -20;
        if (index === 3) return -10;
        if (index === 4) return 10;
      }

      if (total === 6) {
        if (index === 0) return 10;
        if (index === 1) return 0;
        if (index === 2) return -10;
        if (index === 3) return -10;
        if (index === 4) return 0;
        if (index === 5) return 10;
      }

      if (total === 7) {
        if (index === 0) return 0;
        if (index === 1) return -20;
        if (index === 2) return -40.5;
        if (index === 3) return -50;
        if (index === 4) return -40.5;
        if (index === 5) return -10;
        if (index === 6) return 20;
      }

      return 0;
      return index * 10;
    };

    const calcRotate = (index, total = items.length) => {
      if (total === 3) {
        if (index === 0) return 10;
        if (index === 1) return 0;
        if (index === 2) return -10;
      }

      if (total === 4) {
        if (index === 0) return 6;
        if (index === 1) return 0;
        if (index === 2) return -6;
        if (index === 3) return -15;
      }

      if (total === 5) {
        if (index === 0) return 10;
        if (index === 1) return 5;
        if (index === 2) return 0;
        if (index === 3) return -5;
        if (index === 4) return -10;
      }

      if (total === 6) {
        if (index === 0) return 15;
        if (index === 1) return 10;
        if (index === 2) return 5;
        if (index === 3) return -5;
        if (index === 4) return -10;
        if (index === 5) return -15;
      }

      if (total === 7) {
        if (index === 0) return 10;
        if (index === 1) return 10;
        if (index === 2) return 5;
        if (index === 3) return 0;
        if (index === 4) return -10;
        if (index === 5) return -20;
        if (index === 6) return -22;
      }

      return 0;
    };

    const context = () => {
      if (isDown || isDragging) return 'isDown';
      else if (isHovered && !isDragging) return 'isHovered';
      return 'none';
    };

    if (context() === 'isDown' && match)
      return {
        x: x,
        y: y + hoverOffsetY,
        rotate: 0,
        scale: 1,
        marginTop: 0,
        zIndex: 100,
        cursor: 'grabbing',
        immediate: n => n === 'x' || n === 'y' || n === 'scale',
        config: config.default
      };
    else if (context() === 'isHovered' && match)
      return {
        x: 0,
        y: hoverOffsetY,
        rotate: 0,
        scale: 1,
        marginTop: 0,
        zIndex: 100,
        cursor: 'grab',
        immediate: true,
        config: {
          ...config.default,
          tension: 500,
          friction: 38
        }
      };
    // else if (context() === 'isHovered' && gtMatch)
    //   return {
    //     x: 0,
    //     y: 0,
    //     rotate: calcRotate(index) + 10,
    //     scale: 0.665,
    //     marginLeft: calcOffsetX(index) + 40,
    //     marginTop: calcOffsetY(index) + 20,
    //     zIndex: index * -1,
    //     immediate: true,
    //     config: {
    //       ...config.default,
    //       tension: 500,
    //       friction: 38
    //     }
    //   };
    else
      return {
        x: 0,
        y: 0,
        rotate: calcRotate(index),
        scale: 0.665,
        marginLeft: calcOffsetX(index),
        marginTop: calcOffsetY(index),
        zIndex: index * -1,
        cursor: 'grab',
        immediate: n => n === 'zIndex',
        config: config.default
      };
  };

  // Create springs, each corresponds to an item,
  // controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(items.length, fn());

  /**
   * @see https://use-gesture.netlify.app/docs/state
   */
  const bind = useGesture(
    {
      onDrag: ({
        active,
        args: [originalIndex],
        down,
        dragging,
        first,
        movement: [x, y],
        tap
      }) => {
        if (tap) return;
        const curIndex = order.current.indexOf(originalIndex);
        setSprings(
          fn(down, dragging, active, curIndex, first ? 0 : x, first ? 0 : y)
        );
      },
      onDragEnd: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current.indexOf(originalIndex);
        setSprings(fn(down, dragging, active, curIndex));
      },
      onHover: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current.indexOf(originalIndex);
        setSprings(fn(down, dragging, active, curIndex));
      }
    },
    {
      order,
      drag: {
        // Gesture common options
        enabled: true,
        initial: [0, 0],
        threshold: undefined,
        rubberband: 0.15, // 0.15

        // [xy] gestures specific options
        axis: undefined,
        lockDirection: false,

        // drag specific options
        filterTaps: true,
        delay: 0,
        swipeDistance: [60, 60],
        swipeVelocity: [0.5, 0.5]
      }
    }
  );

  return (
    <div
      className={[
        styles['hand'],
        selectedCardObject ? styles['card--is-selected'] : ''
      ].join(' ')}
      data-component="Hand"
    >
      <div
        className={[
          styles['card__tray'],
          selectedCardObject ? styles['card--is-selected'] : ''
        ].join(' ')}
        data-length={items.length}
      >
        {springs.map(
          (
            { cursor, marginLeft, marginTop, rotate, scale, zIndex, x, y },
            i
          ) => {
            const {
              id,
              isGolden,
              isEnhanced,
              isPlayable,
              rarity,
              set,
              type,
              uuid
            } = items[i];

            return (
              <animated.div
                {...bind(i)}
                key={i}
                style={{
                  zIndex,
                  cursor: isPlayable ? cursor : 'default',
                  marginLeft: marginLeft.interpolate(mL => `${mL}px`),
                  marginTop: marginTop.interpolate(mT => `${mT}px`),
                  position: 'absolute',
                  pointerEvents: 'auto',
                  transform: interpolate(
                    [x, y, rotate, scale],
                    (x, y, rt, sc) => {
                      return `translate3d(${x}px, ${y}px, 0) rotate(${rt}deg) scale(${sc})`;
                    }
                  )
                }}
              >
                <HandSlot
                  cardImageBaseSrc={getCardBaseImage(rarity, type)}
                  cardImageFlairSrc={getCardFlairImage(id, set, isGolden)}
                  cardObject={items[i]}
                  cardUuid={uuid}
                  handleCardInteractionClick={handleCardInteractionClick}
                  key={uuid}
                  selectedCardUuid={selectedCardUuid}
                  slotIndex={i}
                  numberOfCardsInHand={items.length}
                  isDesktop={isDesktop}
                  isEnhanced={isEnhanced}
                  isPlayable={isPlayable}
                />
              </animated.div>
            );
          }
        )}
      </div>
    </div>
  );
};

DesktopHand.propTypes = {
  cardsInHand: PropTypes.array,
  deselectCardFunction: PropTypes.func.isRequired,
  handleCardInteractionClick: PropTypes.func.isRequired,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  selectedCardObject: PropTypes.object,
  selectedCardUuid: PropTypes.string,
  isDesktop: PropTypes.bool.isRequired
};

DesktopHand.defaultProps = {
  cardsInHand: [],
  deselectCardFunction: () => {
    console.error('deselectCardFunction() provided as a defaultProp');
  },
  selectedCardObject: null,
  selectedCardUuid: null
};

export default DesktopHand;
