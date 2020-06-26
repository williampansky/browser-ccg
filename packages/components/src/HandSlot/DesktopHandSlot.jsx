import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated, config } from 'react-spring';
import { CardInteractionLayer } from '@ccg/components';
import { limitNumberWithinRange } from '@ccg/utils';
import styles from './styles.module.scss';

const DesktopHandSlot = props => {
  const {
    cardImageBaseSrc,
    cardImageFlairSrc,
    cardObject,
    cardUuid,
    handleCardInteractionClick,
    selectedCardUuid,
    slotIndex,
    trayIsExpanded,
    disableInteraction,
    isDesktop,
    numberOfCardsInHand,
    handleMouseEnter,
    handleMouseLeave
  } = props;

  // abs(($i - ($total - 1) / 2) / ($total - 2) * $offsetRange);
  // const calcOffset = (index, total = 10, offsetRange = 80) => {
  //   total = total + 1;
  //   const MIN = 10;
  //   const MAX = 60;

  //   const calculation = Math.abs(
  //     ((index - (total - 1.85) / 2) / (total - 2)) * offsetRange
  //   );

  //   return limitNumberWithinRange(calculation, MAX, MIN) * -1;
  // };

  // ($i - ($total - 1) / 2) / ($total - 2) * $rotationRange;
  // const calcRotate = (index, total = 10, rotationRange = 50) => {
  //   total = total + 1;
  //   const MIN = -25;
  //   const MAX = 25;
  //   const calculation =
  //     ((index - (total - 1) / 2) / (total - 2)) * rotationRange;

  //   return limitNumberWithinRange(calculation, MAX, MIN) * 0.875;
  // };

  // const [springStyles, set, stop] = useSpring(() => ({
  //   marginLeft: '-150px',
  //   marginBottom: '-150px',
  //   pointerEvents: 'auto',
  //   paddingBottom: '100px',
  //   transform: `
  //     translateY(${calcOffset(slotIndex, numberOfCardsInHand)}px)
  //     rotate(${calcRotate(slotIndex, numberOfCardsInHand)}deg)
  //     scale(0.575)
  //   `,
  //   config: {
  //     ...config.default,
  //     easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
  //   }
  // }));

  // const handleMouseEnter = useCallback(
  //   event => {
  //     event.preventDefault();
  //     if (!isDesktop) return;
  //     if (isDesktop) {
  //       set({
  //         transform: `translateY(-75px) rotate(0deg) scale(1)`
  //       });
  //     }
  //   },
  //   [isDesktop, set]
  // );

  // const handleMouseLeave = useCallback(
  //   event => {
  //     event.preventDefault();
  //     if (!isDesktop) return;
  //     if (isDesktop) {
  //       set({
  //         transform: `
  //           translateY(${calcOffset(slotIndex, numberOfCardsInHand)})
  //           rotate(${calcRotate(slotIndex, numberOfCardsInHand)})
  //           scale(0.575)
  //         `
  //       });
  //     }
  //   },
  //   [isDesktop, set, slotIndex, numberOfCardsInHand]
  // );

  // useEffect(() => {
  //   return () => stop();
  // }, [stop]);

  return (
    <div
      className={[
        styles['hand__slot'],
        disableInteraction ? 'disable-interaction' : ''
      ].join(' ')}
      data-component="DesktopHandSlot"
      data-index={slotIndex}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardInteractionLayer
        card={cardObject}
        cardImageBaseSrc={cardImageBaseSrc}
        cardImageFlairSrc={cardImageFlairSrc}
        handleCardInteractionClick={handleCardInteractionClick}
        index={slotIndex}
        isPlayable={true}
        isSelected={selectedCardUuid === cardUuid ? true : false}
        trayIsExpanded={trayIsExpanded}
        disableInteraction={disableInteraction}
      />
    </div>
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
  trayIsExpanded: PropTypes.bool
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
