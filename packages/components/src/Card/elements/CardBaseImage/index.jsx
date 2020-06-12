import React from 'react';
import PropTypes from 'prop-types';
import { Img } from 'react-image';
import styles from './styles.module.scss';

const CardBaseImage = ({
  imageAlt,
  imageSrc,
  placeholderBaseSrc,
  useReactImage
}) => {
  return useReactImage ? (
    <Img
      alt={`${imageAlt} Card`}
      className={styles['card__base__image']}
      decode={false}
      src={imageSrc}
      loader={<div className={styles['card__base__image__loader']} />}
      unloader={
        <img
          alt=""
          className={styles['card__base__image']}
          src={placeholderBaseSrc}
        />
      }
    />
  ) : (
    <img
      alt={`${imageAlt} Card`}
      className={styles['card__base__image']}
      role="presentation"
      src={imageSrc}
    />
  );
};

CardBaseImage.propTypes = {
  imageAlt: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  placeholderBaseSrc: PropTypes.string.isRequired,
  useReactImage: PropTypes.bool
};

CardBaseImage.defaultProps = {
  useReactImage: false
};

export default CardBaseImage;
