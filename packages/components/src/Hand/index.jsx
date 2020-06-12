import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import { CardInteractionLayer } from '@ccg/components';

const Hand = ({ cardsInHand, imagesDataCards, imagesDataSets }) => {
  return (
    <div className={styles['hand']} data-file="Hand">
      {cardsInHand.map((object, index) => {
        const { id, rarity, set, type, uuid } = object;
        return (
          <div className={styles['card__wrapper']} key={uuid}>
            <CardInteractionLayer
              card={object}
              cardImageBaseSrc={getCardBaseImage(rarity, type, imagesDataCards)}
              cardImageFlairSrc={getCardFlairImage(id, set, imagesDataSets)}
              index={index}
              isPlayable={index === 0 ? false : true}
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
  imagesDataSets: PropTypes.object.isRequired
};

Hand.defaultProps = {
  cardsInHand: [],
  imagesDataCards: {},
  imagesDataSets: {}
};

export default Hand;
