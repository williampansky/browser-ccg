import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const CardBaseImage = ({ imageSrc }) => {
  return (
    <React.Fragment>
      <img
        alt=""
        className={styles['card__base__image']}
        role="presentation"
        src={imageSrc}
      />
    </React.Fragment>
  );
};

CardBaseImage.propTypes = {
  imageSrc: PropTypes.string
};

export default CardBaseImage;
