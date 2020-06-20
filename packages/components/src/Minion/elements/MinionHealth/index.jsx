import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { usePrevious } from '@ccg/hooks';

const MinionHealth = props => {
  const {
    currentHealth,
    elite,
    imageSrc,
    isBuffed,
    isDamaged,
    totalHealth
  } = props;

  const [healthValue, setHealthValue] = useState(0);
  const previousHealthValue = usePrevious(healthValue);

  useEffect(() => {
    setHealthValue(currentHealth);
  }, [currentHealth]);

  return (
    <div
      className={styles['health__wrapper']}
      data-current-health={currentHealth}
      data-total-health={totalHealth}
      data-value={healthValue}
    >
      <div
        className={styles['text']}
        data--is-damaged={isDamaged}
        data--is-buffed={isBuffed}
      >
        <div className="text__value">{healthValue}</div>
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
  isBuffed: PropTypes.bool.isRequired,
  isDamaged: PropTypes.bool.isRequired,
  totalHealth: PropTypes.number.isRequired
};

export default MinionHealth;
