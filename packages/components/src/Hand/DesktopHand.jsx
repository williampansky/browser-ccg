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
  const [hoverIndex, setHoverIndex] = useState(null);

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
  const fn = (order, down, originalIndex, curIndex, x) => index => {
    return down
      ? {
          x: curIndex * -100 + x,
          scale: 1,
          zIndex: curIndex,
          shadow: 15,
          immediate: n => n === 'x' || n === 'zIndex'
        }
      : {
          x: order.indexOf(index) * 50,
          scale: 0.575,
          zIndex: originalIndex,
          rotate: `${calcRotate(curIndex, items.length)}deg`,
          shadow: 1,
          immediate: false
        };
  };

  // Create springs, each corresponds to an item, controlling its styles
  const [springs, setSprings] = useSprings(items.length, fn(order.current));

  const bind = useGesture(({ args: [originalIndex], down, delta: [, x] }) => {
    const curIndex = order.current.indexOf(originalIndex);
    const curRow = clamp(
      Math.round((curIndex * 100 + x) / 100),
      0,
      items.length - 1
    );

    // Feed springs new style data, they'll animate the view without causing a single render
    setSprings(fn(order.current, down, originalIndex, curIndex, x));
  });

  useEffect(() => {
    setSprings();
  }, [hoverIndex, setSprings]);

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
        {springs.map(({ zIndex, shadow, x, rotate, scale }, i) => {
          const { id, isGolden, rarity, set, type, uuid } = items[i];
          return (
            i === 0 && (
              <animated.div
                {...bind(i)}
                key={i}
                style={{
                  zIndex,
                  position: 'absolute',
                  borderRadius: 'calc(var(--card-height) / 28.571428571)px',
                  overflow: 'visible',
                  // transformOrigin: '50% 50% 0px',
                  boxShadow: shadow.interpolate(
                    s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`
                  ),
                  transform: interpolate(
                    [x, rotate, scale],
                    (x, r, s) =>
                      `translate3d(${x}px,0,0) scale(${s}) rotate(${r}deg)`
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
                  handleMouseEnter={() => setHoverIndex(i)}
                  handleMouseLeave={() => setHoverIndex(null)}
                />
              </animated.div>
            )
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
