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

  // abs(($i - ($total - 1) / 2) / ($total - 2) * $offsetRange);
  const calcOffset = (index, total = 10, offsetRange = 80) => {
    total = total + 1;
    const MIN = 10;
    const MAX = 60;

    const calculation = Math.abs(
      ((index - (total - 1.85) / 2) / (total - 2)) * offsetRange
    );

    return clamp(calculation, MIN, MAX) * -1;
  };

  // ($i - ($total - 1) / 2) / ($total - 2) * $rotationRange;
  const calcRotate = (index, total = 10, rotationRange = 50) => {
    total = total + 1;
    const MIN = -25;
    const MAX = 25;
    const calculation =
      ((index - (total - 1) / 2) / (total - 2)) * rotationRange;

    return clamp(calculation, MIN, MAX) * 0.875;
  };

  // Returns fitting styles for dragged/idle items
  const fn = (isDown, isHovered, isCanceled, curIndex, x, y) => index => {
    // console.log(x);
    const match = curIndex === index;

    if (isHovered && !isDown && match)
      return {
        x: index * -50,
        y: -150,
        scale: 1,
        zIndex: 100,
        shadow: 15,
        paddingBottom: 40,
        immediate: n =>
          n === 'x' || n === 'y' || n === 'scale' || n === 'zIndex'
      };
    else if (isDown && match)
      return {
        x: x,
        y: y,
        scale: 1,
        zIndex: 100,
        shadow: 15,
        paddingBottom: 0,
        immediate: n => n === 'paddingBottom'
      };
    else if (isCanceled)
      return {
        x: index * -50,
        y: 0,
        scale: 0.75,
        zIndex: index * -1,
        shadow: 1,
        paddingBottom: 0,
        immediate: n => n === 'zIndex'
      };
    else
      return {
        x: index * -50,
        y: 0,
        scale: 0.75,
        zIndex: index * -1,
        shadow: 1,
        paddingBottom: 0,
        immediate: n => n === 'zIndex'
      };
  };

  // Store indicies as a local ref, this represents the item order
  const order = useRef(items.map((_, index) => index));

  // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(items.length, fn());

  // /**
  //  * @see https://use-gesture.netlify.app/docs/state
  //  */
  // const bind = useGesture(state => {
  //   // prettier-ignore
  //   const {
  //     event,                  // the source event
  //     xy,                     // [x,y] values (pointer position or scroll offset)
  //     previous,               // previous xy
  //     initial,                // xy value when the gesture started
  //     movement,               // last gesture offset (xy - initial)
  //     delta: [, y],           // movement delta (movement - previous movement)
  //     offset,                 // offset since the first gesture
  //     lastOffset,             // offset when the last gesture started
  //     vxvy,                   // momentum of the gesture per axis
  //     velocity,               // absolute velocity of the gesture
  //     distance,               // offset distance
  //     direction,              // direction per axis
  //     startTime,              // gesture start time
  //     elapsedTime,            // gesture elapsed time
  //     timeStamp,              // timestamp of the event
  //     first,                  // true when it's the first event
  //     last,                   // true when it's the last event
  //     active,                 // true when the gesture is active
  //     memo,                   // value returned by your handler on its previous run
  //     cancel,                 // function you can call to interrupt some gestures
  //     canceled,               // whether the gesture was canceled (drag and pinch)
  //     down,                   // true when a mouse button or touch is down
  //     buttons,                // number of buttons pressed
  //     touches,                // number of fingers touching the screen
  //     args: [originalIndex],  // arguments you passed to bind
  //     ctrlKey,                // true when control key is pressed
  //     altKey,                 // "      "  alt     "      "
  //     shiftKey,               // "      "  shift   "      "
  //     metaKey,                // "      "  meta    "      "
  //     dragging,               // is the component currently being dragged
  //     moving,                 // "              "              "  moved
  //     scrolling,              // "              "              "  scrolled
  //     wheeling,               // "              "              "  wheeled
  //     pinching                // "              "              "  pinched
  //   } = state;

  //   console.log(active);
  //   const curIndex = order.current.indexOf(originalIndex);
  //   setSprings(fn(down, curIndex, y));
  // });

  /**
   * @see https://use-gesture.netlify.app/docs/state
   */
  const bind = useGesture(
    {
      onDrag: state => {
        const {
          active: isHovered,
          args: [originalIndex],
          delta,
          initial,
          xy
        } = state;

        const isDown = true;
        const isCanceled = false;
        const curIndex = order.current.indexOf(originalIndex);
        setSprings(
          fn(
            isDown,
            isHovered,
            isCanceled,
            curIndex,
            xy[0] - initial[0] + delta[0],
            xy[1] - initial[1] - 150 + delta[1]
          )
        );
      },
      onDragEnd: state => {
        const {
          active: isHovered,
          args: [originalIndex],
          canceled: isCanceled,
          down: isDown,
          initial
        } = state;

        const curIndex = order.current.indexOf(originalIndex);
        setSprings(
          fn(isDown, isHovered, isCanceled, curIndex, initial[0], initial[1])
        );
      },
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
      onHover: state => {
        const {
          active: isHovered,
          args: [originalIndex],
          delta: [, y],
          down: isDown
        } = state;

        const isCanceled = false;
        const curIndex = order.current.indexOf(originalIndex);
        setSprings(fn(isDown, isHovered, isCanceled, curIndex, 0, y));
      }
    }
    // {
    //   ...config.default,
    //   easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
    // }
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
        {springs.map(({ zIndex, shadow, x, y, scale, paddingBottom }, i) => {
          const { id, isGolden, rarity, set, type, uuid } = items[i];
          return (
            <animated.div
              {...bind(i)}
              key={i}
              style={{
                zIndex,
                paddingBottom: paddingBottom.interpolate(pB => `${pB}px`),
                position: 'absolute',
                pointerEvents: 'auto',
                boxShadow: shadow.interpolate(sh => {
                  return `rgba(0, 0, 0, 0.25) 0px ${sh}px ${2 * sh}px 0px`;
                }),
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
