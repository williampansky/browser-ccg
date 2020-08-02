import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { replaceConstant } from '@ccg/utils/src';

const DeckSlotItem = ({
  amount,
  cardId,
  cardImageSrc,
  cost,
  costImageSrc,
  elite,
  name,
  rarity
}) => {
  return (
    <div
      className={[
        styles['deck__item'],
        amount === 0 ? styles['deck__item--empty'] : ''
      ].join(' ')}
      data-component="DeckItem"
    >
      <div className={styles['item__cost']}>
        <div className="text__value">{cost}</div>
        <img alt="" role="presentation" src={costImageSrc} />
      </div>

      <div className={styles['item__info']}>
        <div className={styles['item__name']}>
          <div className="text__value">{replaceConstant(name)}</div>
        </div>

        {amount === 2 ? (
          <div className={styles['item__amount']}>
            <div className="text__value">{amount}</div>
          </div>
        ) : null}
      </div>

      <picture className={styles['item__image']}>
        <img alt="" role="presentation" src={cardImageSrc} />
      </picture>
    </div>
  );
};

DeckSlotItem.propTypes = {
  amount: PropTypes.number.isRequired,
  cardId: PropTypes.string.isRequired,
  cardImageSrc: PropTypes.string.isRequired,
  cost: PropTypes.number.isRequired,
  costImageSrc: PropTypes.string.isRequired,
  elite: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  rarity: PropTypes.string.isRequired
};

DeckSlotItem.defaultTypes = {
  amount: 0,
  cost: 0,
  elite: false
};

export default DeckSlotItem;
