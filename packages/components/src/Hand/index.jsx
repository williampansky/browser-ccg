import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { CardInteractionLayer } from '@ccg/components';

const Hand = ({ cardsInHand, imagesDataCards, imagesDataSets }) => {
  const [trayIsExpanded, setTrayIsExpanded] = useState(false);

  const handleHandTrayClick = useCallback(
    event => {
      event.preventDefault();
      !trayIsExpanded ? setTrayIsExpanded(true) : setTrayIsExpanded(false);
    },
    [trayIsExpanded, setTrayIsExpanded]
  );

  return (
    <div
      className={[
        styles['hand'],
        trayIsExpanded ? styles['hand--is-expanded'] : ''
      ].join(' ')}
      data-file="Hand"
      onClick={e => handleHandTrayClick(e)}
      onKeyPress={e => handleHandTrayClick(e)}
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
