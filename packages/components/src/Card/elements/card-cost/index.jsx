import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardCost = ({ cost }) => {
  return (
    <div className={styles['card__cost']}>
      <div className="text__value">{cost}</div>
    </div>
  );
};

CardCost.propTypes = {
  cost: PropTypes.number
};

export default CardCost;
