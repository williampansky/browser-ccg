import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardHealth = ({ health, badgeImgSrc, elite }) => (
  <div
    className={[
      styles['card__health'],
      elite ? styles['card__health__elite'] : ''
    ].join(' ')}
  >
    <div className="text__value" data-value={health}>
      {health}
    </div>
    <img
      alt=""
      className={
        elite
          ? styles['card__health__badge__elite']
          : styles['card__health__badge']
      }
      role="presentation"
      src={badgeImgSrc}
    />
  </div>
);

CardHealth.propTypes = {
  health: PropTypes.number.isRequired,
  badgeImgSrc: PropTypes.string.isRequired,
  elite: PropTypes.bool.isRequired
};

export default CardHealth;
