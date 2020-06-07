import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardAttack = ({ attack, badgeImgSrc, elite }) => (
  <div
    className={[
      styles['card__attack'],
      elite ? styles['card__attack__elite'] : ''
    ].join(' ')}
  >
    <div className="text__value" data-value={attack}>
      {attack}
    </div>
    <img
      alt=""
      className={
        elite
          ? styles['card__attack__badge__elite']
          : styles['card__attack__badge']
      }
      role="presentation"
      src={badgeImgSrc}
    />
  </div>
);

CardAttack.propTypes = {
  attack: PropTypes.number.isRequired,
  badgeImgSrc: PropTypes.string.isRequired,
  elite: PropTypes.bool.isRequired
};

export default CardAttack;
