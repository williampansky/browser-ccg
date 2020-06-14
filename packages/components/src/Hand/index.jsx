import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { AppIcon, CardInteractionLayer } from '@ccg/components';
import HandSlot from '../HandSlot';

const Hand = ({
  cardsInHand,
  deselectCardFunction,
  handleCardInteractionClick,
  imagesDataCards,
  imagesDataSets,
  selectedCardObject,
  selectedCardUuid
}) => {
  const [trayIsExpanded, setTrayIsExpanded] = useState(false);

  const handleHandTrayClick = useCallback(
    (event, bool) => {
      event.preventDefault();
      setTrayIsExpanded(bool);
    },
    [setTrayIsExpanded]
  );

  const handleCloseTrayClick = useCallback(
    (event, bool) => {
      event.preventDefault();
      deselectCardFunction(null);
      setTrayIsExpanded(bool);
    },
    [deselectCardFunction, setTrayIsExpanded]
  );

  return (
    <div
      className={[
        styles['hand'],
        trayIsExpanded ? styles['hand--is-expanded'] : '',
        selectedCardObject ? styles['card--is-selected'] : ''
      ].join(' ')}
      data-component="Hand"
      onClick={e => !trayIsExpanded && handleHandTrayClick(e, true)}
      onKeyPress={e => !trayIsExpanded && handleHandTrayClick(e, true)}
      role={trayIsExpanded ? 'presentation' : 'button'}
      tabIndex={trayIsExpanded ? -1 : 0}
    >
      <div
        className={[
          styles['card__tray'],
          trayIsExpanded ? styles['hand--is-expanded'] : '',
          selectedCardObject ? styles['card--is-selected'] : ''
        ].join(' ')}
      >
        {cardsInHand.map((object, index) => {
          const { id, rarity, set, type, uuid } = object;
          return (
            <HandSlot
              cardImageBaseSrc={getCardBaseImage(rarity, type, imagesDataCards)}
              cardImageFlairSrc={getCardFlairImage(id, set, imagesDataSets)}
              cardObject={object}
              cardUuid={uuid}
              handleInteractionClick={handleCardInteractionClick}
              key={uuid}
              selectedCardUuid={selectedCardUuid}
              slotIndex={index}
              trayIsExpanded={trayIsExpanded}
            />
          );
        })}
      </div>

      <div
        className={[
          styles['close__tray__button'],
          trayIsExpanded ? styles['hand--is-expanded'] : ''
        ].join(' ')}
        onClick={e => trayIsExpanded && handleCloseTrayClick(e, false)}
        onKeyPress={e => trayIsExpanded && handleCloseTrayClick(e, false)}
        role="button"
        tabIndex={0}
      >
        <AppIcon color="white" fileName="icon-uikit-close" size="initial" />
      </div>
    </div>
  );
};

Hand.propTypes = {
  cardsInHand: PropTypes.array,
  deselectCardFunction: PropTypes.func.isRequired,
  handleCardInteractionClick: PropTypes.func.isRequired,
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  selectedCardObject: PropTypes.object,
  selectedCardUuid: PropTypes.string
};

Hand.defaultProps = {
  cardsInHand: [],
  imagesDataCards: {},
  imagesDataSets: {}
};

export default Hand;
