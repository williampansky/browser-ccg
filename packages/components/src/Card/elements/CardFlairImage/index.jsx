import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Img } from 'react-image';

const CardFlairImage = ({ imageSrc, name, placeholderSrc }) => {
  return (
    <div className={styles['card__flair__image__wrapper']}>
      <Img
        alt={name}
        className={styles['card__flair__image']}
        src={imageSrc}
        loader={<div className={styles['card__flair__loader']} />}
        unloader={
          <img
            alt=""
            className={styles['card__flair__image']}
            src={placeholderSrc}
          />
        }
      />
    </div>
  );
};

CardFlairImage.propTypes = {
  imageSrc: PropTypes.string,
  name: PropTypes.string,
  placeholderSrc: PropTypes.oneOfType([PropTypes.array, PropTypes.string])
};

export default CardFlairImage;
