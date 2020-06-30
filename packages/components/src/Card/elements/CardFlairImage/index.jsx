import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useImage } from 'react-image';

const CardFlairImage = ({ imageSrc, name }) => {
  const { src } = useImage({ srcList: imageSrc });

  return (
    <div className={styles['card__flair__image__wrapper']}>
      <img
        alt={name}
        className={styles['card__flair__image']}
        role="presentation"
        src={src}
      />
    </div>
  );
};

CardFlairImage.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default CardFlairImage;
