import React from 'react';
import PropTypes from 'prop-types';
import { useImage } from 'react-image';
import styles from './styles.module.scss';

const CardBaseImage = ({
  imageAlt,
  imageSrc,
  placeholderBaseSrc,
  useReactImage
}) => {
  const { src } = useImage({ srcList: imageSrc });
  return useReactImage ? (
    <img
      alt={imageAlt}
      className={styles['card__base__image']}
      role="presentation"
      src={src}
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
