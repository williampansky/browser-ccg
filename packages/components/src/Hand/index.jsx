import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { CardInteractionLayer } from '@ccg/components';
import AppIcon from '../AppIcon';

const Hand = ({ cardsInHand, imagesDataCards, imagesDataSets }) => {
  const [trayIsExpanded, setTrayIsExpanded] = useState(false);

  const handleHandTrayClick = useCallback(
    (event, bool) => {
      event.preventDefault();
      setTrayIsExpanded(bool);
    },
    [setTrayIsExpanded]
  );

  return (
    <div
      className={[
        styles['hand'],
        trayIsExpanded ? styles['hand--is-expanded'] : ''
      ].join(' ')}
      data-file="Hand"
      onClick={e => !trayIsExpanded && handleHandTrayClick(e, true)}
      onKeyPress={e => !trayIsExpanded && handleHandTrayClick(e, true)}
      role="button"
      tabIndex={0}
    >
      {cardsInHand.map((object, index) => {
        const { id, rarity, set, type, uuid } = object;
        return (
          <div className={styles['card__wrapper']} key={uuid}>
            <CardInteractionLayer
              card={object}
              cardImageBaseSrc={getCardBaseImage(rarity, type, imagesDataCards)}
              cardImageFlairSrc={getCardFlairImage(id, set, imagesDataSets)}
              index={index}
              isPlayable={false}
              isSelected={false}
            />
          </div>
        );
      })}

      <div
        className={[
          styles['close__tray__button'],
          trayIsExpanded ? styles['hand--is-expanded'] : ''
        ].join(' ')}
        onClick={e => trayIsExpanded && handleHandTrayClick(e, false)}
        onKeyPress={e => trayIsExpanded && handleHandTrayClick(e, false)}
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
  imagesDataCards: PropTypes.object.isRequired,
  imagesDataSets: PropTypes.object.isRequired,
  trayIsExpanded: PropTypes.bool.isRequired
};

Hand.defaultProps = {
  cardsInHand: [],
  imagesDataCards: {},
  imagesDataSets: {},
  trayIsExpanded: true
};

export default Hand;
