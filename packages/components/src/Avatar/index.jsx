import React from 'react';
import PropTypes from 'prop-types';
import { Img } from 'react-image';
import styles from './styles.module.scss';
import { PlayerInteractionLayer } from '@ccg/components';

const Avatar = props => {
  const {
    handlePlayerInteractionClick,
    heroImageSrc,
    heroName,
    parentComponent,
    placeholderImageSrc
  } = props;

  return (
    <div className={styles['avatar']}>
      <div className={styles['avatar__position__block']} />
      <PlayerInteractionLayer
        handlePlayerInteractionClick={handlePlayerInteractionClick}
        parentComponent={parentComponent}
      >
        <picture
          className={styles['avatar__image__wrapper']}
          data-component="Avatar"
        >
          <Img
            alt={heroName}
            className={styles['avatar__image']}
            decode={true}
            src={heroImageSrc}
            loader={<div className={styles['avatar__loader']} />}
            role="presentation"
            unloader={
              <img
                alt="Hero Not Found"
                className={styles['avatar__image']}
                role="presentation"
                src={placeholderImageSrc}
              />
            }
          />
        </picture>
      </PlayerInteractionLayer>
    </div>
  );
};

Avatar.propTypes = {
  heroImageSrc: PropTypes.string.isRequired,
  heroName: PropTypes.string.isRequired,
  placeholderImageSrc: PropTypes.string.isRequired
};

export default Avatar;
