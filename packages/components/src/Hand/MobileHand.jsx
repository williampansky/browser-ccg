import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useSpring, animated, config } from 'react-spring';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { AppIcon, HandSlot } from '@ccg/components';

const Hand = props => {
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

  const [trayIsExpanded, setTrayIsExpanded] = useState(false);

  const handleFilterStyle = useCallback(() => {
    if (selectedCardUuid && !disableInteraction) return 'blur(2px)';
    else return 'blur(0px)';
  }, [disableInteraction, selectedCardUuid]);

  const handleTranslateStyle = useCallback(() => {
    if (trayIsExpanded) {
      if (selectedCardUuid) return 'translateY(180px)';
      else return 'translateY(-100px)';
    } else {
      return 'translateY(180px)';
    }
  }, [selectedCardUuid, trayIsExpanded]);

  const style = useSpring({
    filter: handleFilterStyle(),
    transform: handleTranslateStyle(),
    config: {
      ...config.default,
      easing: 'cubic-bezier(0.19, 1, 0.22, 1)'
    }
  });

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

  useEffect(() => {
    selectedCardInteractionContext === null && setTrayIsExpanded(false);
  }, [selectedCardInteractionContext]);

  return (
    <animated.div
      className={[
        styles['hand'],
        trayIsExpanded && !disableInteraction
          ? styles['hand--is-expanded']
          : '',
        selectedCardObject ? styles['card--is-selected'] : '',
        disableInteraction ? 'disable-interaction' : ''
      ].join(' ')}
      data-component="Hand"
      onClick={e => !trayIsExpanded && handleHandTrayClick(e, true)}
      onKeyPress={e => !trayIsExpanded && handleHandTrayClick(e, true)}
      role={trayIsExpanded ? 'presentation' : 'button'}
      style={style}
      tabIndex={trayIsExpanded ? -1 : 0}
    >
      <div
        className={[
          styles['card__tray'],
          trayIsExpanded ? styles['hand--is-expanded'] : '',
          selectedCardObject ? styles['card--is-selected'] : ''
        ].join(' ')}
      >
        {cardsInHand.length ? (
          cardsInHand.map((object, index) => {
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
                trayIsExpanded={trayIsExpanded}
                numberOfCardsInHand={cardsInHand.length}
                isDesktop={isDesktop}
              />
            );
          })
        ) : (
          <div
            style={{
              height: 'var(--card-height)',
              width: '100%',
              opacity: 0,
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <div
        className={[
          styles['close__tray__button'],
          trayIsExpanded && !selectedCardUuid ? styles['hand--is-expanded'] : ''
        ].join(' ')}
        onClick={e => trayIsExpanded && handleCloseTrayClick(e, false)}
        onKeyPress={e => trayIsExpanded && handleCloseTrayClick(e, false)}
        role="button"
        tabIndex={0}
      >
        <AppIcon color="inherit" fileName="icon-uikit-close" size="initial" />
      </div>
    </animated.div>
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
  // deselectCardFunction: () => {
  //   console.error('Hand: deselectCardFunction() provided as a defaultProp');
  // },
  selectedCardObject: null,
  selectedCardUuid: null
};

export default Hand;
