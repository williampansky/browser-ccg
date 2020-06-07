import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const MinionHealth = ({ currentHealth, elite, imageSrc, isDamaged }) => {
  return (
    <div className={styles['health__wrapper']} data-value={currentHealth}>
      <div className={styles['text']} data--is-damaged={isDamaged}>
        <div className="text__value">{currentHealth}</div>
      </div>

      {elite ? (
        <img
          alt=""
          className={[styles['badge'], styles['elite']].join(' ')}
          role="presentation"
          src={imageSrc}
        />
      ) : (
        <img
          alt=""
          className={styles['badge']}
          role="presentation"
          src={imageSrc}
        />
      )}
    </div>
  );
};

MinionHealth.propTypes = {
  currentHealth: PropTypes.number.isRequired,
  elite: PropTypes.bool.isRequired,
  imageSrc: PropTypes.string.isRequired,
  isDamaged: PropTypes.bool.isRequired
};

export default MinionHealth;
