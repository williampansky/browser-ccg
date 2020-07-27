/* eslint-disable no-unused-vars */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useSprings, animated, config, interpolate } from 'react-spring';
import { useCallbackRef } from 'use-callback-ref';
import { useHover, useGesture } from 'react-use-gesture';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { HandSlot } from '@ccg/components';
import { PLAY_TYPE, TYPE } from '@ccg/enums/src';

const DesktopHand = props => {
  const {
    cardsInHand: items,
    deselectCardFunction,
    selectCardFunction,
    handleCardInteractionClick,
    handleCardHoverFunction,
    selectCardContextFunction,
    handleInitTargetedCardFunction,
    selectedCardObject,
    selectedCardIndex,
    selectedCardUuid,
    isDesktop,
    yourId
  } = props;

  // Store indicies as a local ref, this represents the item order
  const [_, update] = useState(null);

  const order = useCallbackRef(
    Array.from(Array(10)).map((_, index) => index),
    () => update({})
  );

  // Returns fitting styles for dragged/idle items
  const fn = (isDown, isDragging, isHovered, curIndex, x, y) => index => {
    const logMatch = false;
    const disableRotation = false;
    const match = curIndex === index;
    const nextMatch = curIndex === index + 1;
    const prevMatch = curIndex === index - 1;
    const gtMatch = curIndex > index;
    const ltMatch = curIndex < index;
    const hoverOffsetY = -160;

    if (match && logMatch)
      console.log(
        `isDown:(${isDown}), isHovered:(${isHovered}), xy:(${x},${y})`
      );

    const calcOffsetX = (index, total = items.length) => {
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

    const calcOffsetY = (index, total = items.length) => {
      if (disableRotation) return 0;

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
        if (index === 0) return 25;
        if (index === 1) return 0;
        if (index === 2) return -10;
        if (index === 3) return -10;
        if (index === 4) return 0;
        if (index === 5) return 25;
      }

      if (total === 7) {
        if (index === 0) return 0;
        if (index === 1) return -20;
        if (index === 2) return -25;
        if (index === 3) return -30;
        if (index === 4) return -25;
        if (index === 5) return -10;
        if (index === 6) return 20;
      }

      if (total === 8) {
        if (index === 0) return 20;
        if (index === 1) return 0;
        if (index === 2) return -10;
        if (index === 3) return -20;
        if (index === 4) return -20.5;
        if (index === 5) return -10.5;
        if (index === 6) return 0;
        if (index === 7) return 20;
      }

      if (total === 9) {
        if (index === 0) return 30;
        if (index === 1) return 0;
        if (index === 2) return -20;
        if (index === 3) return -30;
        if (index === 4) return -40;
        if (index === 5) return -30;
        if (index === 6) return -20;
        if (index === 7) return 0;
        if (index === 8) return 30;
      }

      if (total === 10) {
        if (index === 0) return 20;
        if (index === 1) return 10;
        if (index === 2) return 0;
        if (index === 3) return -10;
        if (index === 4) return -21;
        if (index === 5) return -20;
        if (index === 6) return -10;
        if (index === 7) return 0;
        if (index === 8) return 20;
        if (index === 9) return 40;
      }

      return 0;
    };

    const calcRotate = (index, total = items.length) => {
      if (disableRotation) return 0;

      if (total === 3) {
        if (index === 0) return -10;
        if (index === 1) return 0;
        if (index === 2) return 10;
      }

      if (total === 4) {
        if (index === 0) return -15;
        if (index === 1) return -6;
        if (index === 2) return 0;
        if (index === 3) return 6;
      }

      if (total === 5) {
        if (index === 0) return -10;
        if (index === 1) return -5;
        if (index === 2) return 0;
        if (index === 3) return 5;
        if (index === 4) return 10;
      }

      if (total === 6) {
        if (index === 0) return -15;
        if (index === 1) return -10;
        if (index === 2) return -5;
        if (index === 3) return 5;
        if (index === 4) return 10;
        if (index === 5) return 15;
      }

      if (total === 7) {
        if (index === 0) return -15;
        if (index === 1) return -10;
        if (index === 2) return -5;
        if (index === 3) return 0;
        if (index === 4) return 10;
        if (index === 5) return 15;
        if (index === 6) return 20;
      }

      if (total === 8) {
        if (index === 0) return -20;
        if (index === 1) return -10;
        if (index === 2) return -5;
        if (index === 3) return -2.5;
        if (index === 4) return 2.5;
        if (index === 5) return 5;
        if (index === 6) return 10;
        if (index === 7) return 20;
      }

      if (total === 9) {
        if (index === 0) return -20;
        if (index === 1) return -15;
        if (index === 2) return -5;
        if (index === 3) return -2.5;
        if (index === 4) return 0;
        if (index === 5) return 5;
        if (index === 6) return 10;
        if (index === 7) return 15;
        if (index === 8) return 20;
      }

      if (total === 10) {
        if (index === 0) return -20;
        if (index === 1) return -10;
        if (index === 2) return -5;
        if (index === 3) return -2.5;
        if (index === 4) return 0;
        if (index === 5) return 5;
        if (index === 6) return 10;
        if (index === 7) return 14;
        if (index === 8) return 16;
        if (index === 9) return 18;
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
    else if (context() === 'isHovered' && match) {
      return {
        display: 'none', // disables hidden hover listener div
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
          friction: 38,
          duration: 75
        }
      };
    } else {
      return {
        x: 0,
        y: 0,
        rotate: calcRotate(index),
        scale: 0.665,
        marginLeft: calcOffsetX(index),
        marginTop: calcOffsetY(index),
        zIndex: index * 1,
        cursor: 'grab',
        display: 'block',
        immediate: n => n === 'zIndex',
        config: config.default
      };
    }
  };

  // Create springs, each corresponds to an item,
  // controlling its transform, scale, etc.
  const [springs, setSprings] = useSprings(items.length, fn());

  /**
   * @see https://use-gesture.netlify.app/docs/state
   */
  const bind = useGesture(
    {
      onDragStart: ({ active, args: [originalIndex], down, dragging }) => {
        const curIndex = order.current.indexOf(originalIndex);
        setSprings(fn(down, dragging, active, curIndex));
      },
      onDrag: ({
        active,
        args: [originalIndex, isPlayable, playType, type],
        cancel,
        down,
        dragging,
        first,
        movement: [x, y],
        tap
      }) => {
        const curIndex = order.current.indexOf(originalIndex);

        if (tap) return;
        else if (!isPlayable && y <= -150) cancel();
        else if (
          playType === PLAY_TYPE['TARGETED'] &&
          (type === TYPE['SPELL'] || type === TYPE['ITEM']) &&
          y <= -100
        ) {
          if (selectedCardObject === null) return;
          handleInitTargetedCardFunction(selectedCardObject, curIndex);
        } else {
          setSprings(
            fn(down, dragging, active, curIndex, first ? 0 : x, first ? 0 : y)
          );
        }
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
        rubberband: 0.915, // 0.15

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

  const bindHover = useHover(
    ({ active, args: [originalIndex] }) => {
      const curIndex = order.current.indexOf(originalIndex);
      setSprings(fn(false, false, active, curIndex));

      // console.log(originalIndex);
      // setHoveringCard(curIndex); // WIP. has huge perf issues
    },
    { order }
  );

  const handleMouseDown = useCallback(
    (e, bool, i) => {
      e.preventDefault();
      if (bool) {
        selectCardFunction(items[i], i);
      }
    },
    [items, selectCardFunction]
  );

  const handleMouseUp = useCallback(
    e => {
      e.preventDefault();
      deselectCardFunction();
    },
    [deselectCardFunction]
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
            {
              cursor,
              display,
              marginLeft,
              marginTop,
              rotate,
              scale,
              zIndex,
              x,
              y
            },
            i
          ) => {
            const {
              id,
              isGolden,
              isEnhanced,
              isPlayable,
              isPlaying,
              playType,
              rarity,
              set,
              type,
              uuid
            } = items[i];

            return order && order.current[i] === i ? (
              <React.Fragment key={i}>
                <animated.div
                  {...bindHover(i, isPlayable)}
                  className={styles['hover__slot__block']}
                  key={`HoverSlot_${i}`}
                  style={{
                    display,
                    cursor: isPlayable ? cursor : 'default',
                    zIndex: 110 - i,
                    marginLeft: marginLeft.interpolate(mL => `${mL}px`)
                  }}
                />

                <animated.div
                  {...bind(i, isPlayable, playType, type)}
                  className={styles['drag__slot__block']}
                  key={`DragSlot_${i}`}
                  onMouseDownCapture={e => handleMouseDown(e, isPlayable, i)}
                  onMouseUpCapture={e => handleMouseUp(e)}
                  style={{
                    zIndex: 110 - i,
                    display: 'block',
                    cursor: isPlayable ? cursor : 'default',
                    marginLeft: marginLeft.interpolate(mL => `${mL}px`),
                    pointerEvents: 'auto',
                    position: 'absolute',
                    top: 40,
                    transform: interpolate([x, y], (x, y) => {
                      return `translate3d(${x}px, ${y}px, 0)`;
                    })
                  }}
                />

                <animated.div
                  {...bind(i, isPlayable, playType, type)}
                  key={`HandSlot_${i}`}
                  data-card-id={id}
                  // data-hand-slot={i}
                  // data-hand-order={order.current.indexOf(i)}
                  style={{
                    zIndex,
                    display: 'block',
                    cursor: isPlayable ? cursor : 'default',
                    marginLeft: marginLeft.interpolate(mL => `${mL}px`),
                    marginTop: marginTop.interpolate(mT => `${mT}px`),
                    opacity:
                      playType === PLAY_TYPE['TARGETED'] &&
                      (type === TYPE['ITEM'] || type === TYPE['SPELL']) &&
                      selectedCardIndex === i
                        ? 0
                        : 1,
                    pointerEvents: 'none',
                    position: 'absolute',
                    transform: interpolate(
                      [x, y, rotate, scale],
                      (x, y, rt, sc) => {
                        return `
                        translate3d(${x}px, ${y}px, 0) 
                        rotate(${rt}deg) 
                        scale(${sc})
                      `;
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
              </React.Fragment>
            ) : null;
          }
        )}
      </div>
    </div>
  );
};

DesktopHand.propTypes = {
  cardsInHand: PropTypes.array,
  deselectCardFunction: PropTypes.func.isRequired,
  handleCardHoverFunction: PropTypes.func.isRequired,
  handleCardInteractionClick: PropTypes.func.isRequired,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  isDesktop: PropTypes.bool.isRequired,
  selectCardContextFunction: PropTypes.func.isRequired,
  selectCardFunction: PropTypes.func.isRequired,
  selectedCardObject: PropTypes.object,
  selectedCardUuid: PropTypes.string
};

DesktopHand.defaultProps = {
  cardsInHand: [],
  deselectCardFunction: () => {
    console.error('deselectCardFunction() provided as a defaultProp');
  },
  handleCardHoverFunction: () => {
    console.error('handleCardHoverFunction() provided as a defaultProp');
  },
  selectedCardObject: null,
  selectedCardUuid: null
};

export default DesktopHand;
