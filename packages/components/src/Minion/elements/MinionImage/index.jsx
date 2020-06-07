import React from 'react';
import PropTypes from 'prop-types';
import { Img } from 'react-image';
import styles from './styles.module.scss';

const MinionImage = ({ imgSrc, name, placeholderSrc }) => (
  <div className={styles['image__wrapper']} data-file="Minion/image">
    <div className="concealed__clouds" style={{ display: 'none' }} />
    <Img
      alt={name}
      className={styles['image']}
      decode={false}
      src={imgSrc}
      loader={<div className={styles['loader']} />}
      role="presentation"
      unloader={
        <img
          alt=""
          className={styles['image']}
          role="presentation"
          src={placeholderSrc}
        />
      }
    />
  </div>
);

MinionImage.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholderSrc: PropTypes.string.isRequired
};

export default MinionImage;
