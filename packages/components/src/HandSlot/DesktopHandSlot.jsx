import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
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

  return (
    <div
      className={[styles['hand__slot']].join(' ')}
      data-component="DesktopHandSlot"
      data-index={slotIndex}
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
        {...props}
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
  trayIsExpanded: PropTypes.bool,
  isDesktop: PropTypes.bool.isRequired
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
