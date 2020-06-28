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
    cardsInHand,
    deselectCardFunction,
    handleCardInteractionClick,
    selectedCardObject,
    selectedCardUuid,
    isDesktop
  } = props;

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
        {cardsInHand.map((card, i) => {
          const {
            id,
            isEnhanced,
            isGolden,
            isPlayable,
            rarity,
            set,
            type,
            uuid
          } = card;

          return (
            <HandSlot
              cardImageBaseSrc={getCardBaseImage(rarity, type)}
              cardImageFlairSrc={getCardFlairImage(id, set, isGolden)}
              cardObject={card}
              cardUuid={uuid}
              handleCardInteractionClick={handleCardInteractionClick}
              key={uuid}
              selectedCardUuid={selectedCardUuid}
              slotIndex={i}
              numberOfCardsInHand={cardsInHand.length}
              isDesktop={isDesktop}
              isEnhanced={isEnhanced}
              isPlayable={isPlayable}
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
