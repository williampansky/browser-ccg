import React from 'react';
import PropTypes from 'prop-types';
import { Img, useImage } from 'react-image';
import styles from './styles.module.scss';
import { WillExpire, Hidden } from '@ccg/components';

const MinionImage = props => {
  const {
    imgSrc,
    name,
    placeholderSrc,
    isHidden,
    isHiddenSrc,
    willExpire
  } = props;
  const { src } = useImage({ srcList: imgSrc });

  return (
    <div className={styles['image__wrapper']} data-file="Minion/image">
      <div className="concealed__clouds" style={{ display: 'none' }} />
      <Hidden active={isHidden} src={isHiddenSrc} />
      <WillExpire active={willExpire} />
      <img
        alt={name}
        className={styles['image']}
        role="presentation"
        src={src}
      />
      {/* <Img
        alt={name}
        className={styles['image']}
        decode={true}
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
      /> */}
    </div>
  );
};

MinionImage.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholderSrc: PropTypes.string.isRequired
};

export default MinionImage;
