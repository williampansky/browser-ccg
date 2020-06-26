import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useSpring, animated, config } from 'react-spring';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { AppIcon, HandSlot } from '@ccg/components';

const DesktopHand = props => {
  const {
    cardsInHand,
    deselectCardFunction,
    handleCardInteractionClick,
    selectedCardObject,
    selectedCardUuid,
    selectedCardInteractionContext,
    disableInteraction,
    isDesktop
  } = props;

  return (
    <div
      className={[
        styles['hand'],
        selectedCardObject ? styles['card--is-selected'] : '',
        disableInteraction ? 'disable-interaction' : ''
      ].join(' ')}
      data-component="Hand"
    >
      <div
        className={[
          styles['card__tray'],
          selectedCardObject ? styles['card--is-selected'] : ''
        ].join(' ')}
      >
        {cardsInHand.map((object, index) => {
          const { id, isGolden, rarity, set, type, uuid } = object;
          return (
            <HandSlot
              cardImageBaseSrc={getCardBaseImage(rarity, type)}
              cardImageFlairSrc={getCardFlairImage(id, set, isGolden)}
              cardObject={object}
              cardUuid={uuid}
              disableInteraction={disableInteraction}
              handleCardInteractionClick={handleCardInteractionClick}
              key={uuid}
              selectedCardUuid={selectedCardUuid}
              slotIndex={index}
              numberOfCardsInHand={cardsInHand.length}
              isDesktop={isDesktop}
            />
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
  selectedCardUuid: PropTypes.string
};

DesktopHand.defaultProps = {
  cardsInHand: [],
  // deselectCardFunction: () => {
  //   console.error('Hand: deselectCardFunction() provided as a defaultProp');
  // },
  selectedCardObject: null,
  selectedCardUuid: null
};

export default DesktopHand;
