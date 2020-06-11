import React from 'react';
import PropTypes from 'prop-types';
// import { Img } from 'react-image';
import styles from './styles.module.scss';
import { DeckSlotItem } from '@ccg/components';
import { getCardDeckImage } from '@ccg/utils';

const PlayerDeck = ({ costImageSrc, playerDeck, playerPlayedCards }) => {
  return (
    <div className={styles['deck']} data-file="Deck">
      {playerDeck.map((item, index) => {
        const { _amount, cost, elite, id, name, rarity, set } = item;

        return id ? (
          <div key={index}>
            <DeckSlotItem
              amount={_amount}
              cardImageSrc={getCardDeckImage(id, set)}
              costImageSrc={costImageSrc}
              cardId={id}
              cost={cost}
              elite={elite}
              name={name}
              rarity={rarity}
            />
          </div>
        ) : null;
      })}
    </div>
  );
};

PlayerDeck.propTypes = {
  costImageSrc: PropTypes.string.isRequired,
  playerDeck: PropTypes.array.isRequired
  // heroName: PropTypes.string.isRequired,
  // placeholderImageSrc: PropTypes.string.isRequired
};

PlayerDeck.defaultProps = {
  costImageSrc: '',
  playerDeck: []
};

export default PlayerDeck;
