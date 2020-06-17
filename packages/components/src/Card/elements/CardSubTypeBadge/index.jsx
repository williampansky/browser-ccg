import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardSubTypeBadge = ({ badgeImgSrc, subtypeIconAlt, subtypeImgSrc }) => (
  <div className={styles['card__subtype__image__wrapper']}>
    <div className={styles['card__subtype__image__icon__wrapper']}>
      <img
        alt={`${subtypeIconAlt} Icon`}
        className={styles['card__subtype__image']}
        role="presentation"
        src={subtypeImgSrc}
      />
    </div>
    <img
      alt=""
      className={styles['card__subtype__image__badge']}
      role="presentation"
      src={badgeImgSrc}
    />
  </div>
);

CardSubTypeBadge.propTypes = {
  badgeImgSrc: PropTypes.string,
  subtypeIconAlt: PropTypes.string,
  subtypeImgSrc: PropTypes.string
};

export default CardSubTypeBadge;
