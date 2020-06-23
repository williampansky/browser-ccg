import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const MinionAttack = ({ currentAttack, elite, imageSrc }) => {
  return (
    <div
      className={styles['attack__wrapper']}
      data-component="MinionAttack"
      data-value={currentAttack}
    >
      <div className={[styles['text'], elite ? styles['elite'] : ''].join(' ')}>
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

MinionAttack.propTypes = {
  currentAttack: PropTypes.number.isRequired,
  elite: PropTypes.bool.isRequired,
  imageSrc: PropTypes.string.isRequired
};

export default MinionAttack;
