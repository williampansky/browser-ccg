import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const Attack = ({ currentAttack, elite, imageSrc }) => {
  return (
    <div className={styles['attack__wrapper']} data-value={currentAttack}>
      <div className={styles['text']}>
        <div className="text__value">{currentAttack}</div>
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

Attack.propTypes = {
  currentAttack: PropTypes.number.isRequired,
  elite: PropTypes.bool.isRequired,
  imageSrc: PropTypes.bool.isRequired
};

export default Attack;
