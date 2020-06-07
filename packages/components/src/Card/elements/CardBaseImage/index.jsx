import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardBaseImage = ({ imageAlt, imageSrc }) => {
  return (
    <React.Fragment>
      <img
        alt={`${imageAlt} Card`}
        className={styles['card__base__image']}
        role="presentation"
        src={imageSrc}
      />
    </React.Fragment>
  );
};

CardBaseImage.propTypes = {
  imageAlt: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired
};

export default CardBaseImage;
