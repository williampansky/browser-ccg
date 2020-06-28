import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { AppIcon, HandSlot } from '@ccg/components';
import clamp from 'lodash-es/clamp';
import { useGesture } from 'react-use-gesture';
import { useSprings, animated, config, interpolate } from 'react-spring';

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
  // for cursor effects
  const [isDragging, setIsDragging] = useState(false);

  const dragConfig = {
    enableDrag: true,
    enableScale: true,
    enableHover: false,
    enableRotation: false
  };

  const determineMouseCursor = useCallback((isDragging, isPlayable) => {
    if (!isPlayable) return 'default';
    return isDragging ? 'grabbing' : 'grab';
  }, []);

  const determineTransform = useCallback((sc, rt, x, y) => {
    return `
        translate3d(${x}px, ${y}px, 0)
        scale(${sc})
        rotate(${rt}deg)
      `;
  }, []);

  // Returns fitting styles for dragged/idle items
  const fn = (isDown, isHovered, curIndex, x, y) => index => {
    const match = curIndex === index;

    // if (match)
    //   console.log(
    //     `isDown:(${isDown}), isHovered:(${isHovered}), xy:(${x},${y})`
    //   );

    if (isDown && match) {
      return {
        x: x,
        y: y,
        scale: 1,
        zIndex: 100,
        immediate: n => n === 'paddingBottom'
      };
    } else {
      return {
        x: 0,
        y: 0,
        marginLeft: index * -85,
        scale: 0.525,
        zIndex: index * -1,
        immediate: n => n === 'zIndex'
      };
    }
  };

  // Create springs, each corresponds to an item,
  // controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(items.length, fn(), {
    ...config.default,
    easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
  });

  /**
   * @see https://use-gesture.netlify.app/docs/state
   */
  const bind = useGesture(
    {
      onDrag: state => {
        const {
          active: isHovered,
          args: [originalIndex],
          down: isDown,
          first,
          // delta: [dX, dY],
          initial: [iX, iY],
          previous: [pX, pY],
          memo,
          movement: [x, y]
        } = state;

        console.log(pX);

        const curIndex = order.current.indexOf(originalIndex);
        setIsDragging(true);

        // prettier-ignore
        setSprings(
          fn(
            isDown,
            isHovered,
            curIndex,
            first ? 0 : x,
            first ? 0 : y
          )
        );
      },

      onDragEnd: state => {
        const {
          active: isHovered,
          args: [originalIndex],
          down: isDown,
          initial
        } = state;

        const curIndex = order.current.indexOf(originalIndex);
        setIsDragging(false);
        setSprings(fn(isDown, isHovered, curIndex, initial[0], initial[1]));
      }
      // onPinch: state => doSomethingWith(state),
      // onPinchStart: state => doSomethingWith(state),
      // onPinchEnd: state => doSomethingWith(state),
      // onScroll: state => doSomethingWith(state),
      // onScrollStart: state => doSomethingWith(state),
      // onScrollEnd: state => doSomethingWith(state),
      // onMove: state => doSomethingWith(state),
      // onMoveStart: state => doSomethingWith(state),
      // onMoveEnd: state => doSomethingWith(state),
      // onWheel: state => doSomethingWith(state),
      // onWheelStart: state => doSomethingWith(state),
      // onWheelEnd: state => doSomethingWith(state),
    },
    {
      order,
      // eventOptions: { capture: false, passive: true }
      drag: {
        // Gesture common options
        enabled: true,
        initial: [0, 0],
        threshold: undefined,
        rubberband: 1, // 0.15

        // [xy] gestures specific options
        axis: undefined,
        lockDirection: false,
        // bounds: { top: 200, bottom: -50, left: 100, right: 100 }

        // drag specific options
        filterTaps: false,
        delay: 0,
        swipeDistance: [60, 60],
        swipeVelocity: [0.5, 0.5]

        //   initial: () => {
        //     console.log(springs);
        //     return [0, 0];
        //     // return [springs[0].x.get(), springs[0].y.get()];
        //   }
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
      >
        {springs.map(({ marginLeft, scale, zIndex, x, y }, i) => {
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
                cursor: determineMouseCursor(isDragging, isPlayable),
                marginLeft: marginLeft.interpolate(mL => `${mL}px`),
                position: 'absolute',
                pointerEvents: 'auto',
                transform: interpolate([x, y, scale], (x, y, sc) => {
                  return `translate3d(${x}px, ${y}px, 0) scale(${sc})`;
                })
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
        })}
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
