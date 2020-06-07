import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardName = ({ formatter, name }) => (
  <div className={styles['card__name']}>
    <div
      className="text__value"
      style={{
        fontSize: `${formatter(name)}em`
      }}
    >
      {name}
    </div>
  </div>
);

CardName.propTypes = {
  formatter: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export default CardName;
