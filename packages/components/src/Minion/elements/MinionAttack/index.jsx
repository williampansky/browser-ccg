import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const MinionAttack = ({
  currentAttack,
  elite,
  imageSrc,
  isDebuffed,
  isBuffed,
  totalAttack
}) => {
  return (
    <div
      className={styles['attack__wrapper']}
      data-component="MinionAttack"
      data-value={currentAttack}
      data-total-value={totalAttack}
    >
      <div
        className={[styles['text'], elite ? styles['elite'] : ''].join(' ')}
        data--is-buffed={isBuffed}
        data--is-debuffed={isDebuffed}
      >
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
