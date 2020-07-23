import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const MechanicIcon = props => {
  const {
    hasBoon,
    hasBoonSrc,
    hasDoubleAttack,
    hasDoubleAttackSrc,
    hasEventListener,
    hasEventListenerSrc,
    hasOnDeath,
    hasOnDeathSrc,
    hasPoison,
    hasPoisonSrc,
    willExpire,
    willExpireIn
  } = props;

  function getDataLength() {
    let num = 0;
    if (hasOnDeath) num = num + 1;
    if (hasDoubleAttack) num = num + 1;
    if (hasPoison) num = num + 1;
    return num;
  }

  if (willExpire) {
    return (
      <div
        className={[
          styles['minion__mechanics'],
          styles['minion__mechanics--will-expire']
        ].join(' ')}
      >
        <span className="text__value">{willExpireIn}</span>
      </div>
    );
  } else if (hasBoon) {
    return (
      <div className={styles['minion__mechanics']}>
        <img alt="hasBoon" src={hasBoonSrc} />
      </div>
    );
  } else if (hasOnDeath) {
    return (
      <div className={styles['minion__mechanics']}>
        <img alt="hasOnDeath" src={hasOnDeath} />
      </div>
    );
  } else if (hasEventListener) {
    return (
      <div className={styles['minion__mechanics']}>
        <img alt="hasEventListener" src={hasEventListenerSrc} />
      </div>
    );
  } else if (hasPoison) {
    return (
      <div className={styles['minion__mechanics']}>
        <img alt="hasPoison" src={hasPoisonSrc} />
      </div>
    );
  } else if (hasDoubleAttack) {
    return (
      <div className={styles['minion__mechanics']}>
        <img alt="hasDoubleAttack" src={hasDoubleAttackSrc} />
      </div>
    );
  } else {
    return null;
  }
};

MechanicIcon.propTypes = {
  hasBoon: PropTypes.bool,
  hasBoonSrc: PropTypes.string,
  hasDoubleAttack: PropTypes.bool,
  hasDoubleAttackSrc: PropTypes.string,
  hasEventListener: PropTypes.bool,
  hasEventListenerSrc: PropTypes.string,
  hasOnDeath: PropTypes.bool,
  hasOnDeathSrc: PropTypes.string,
  hasPoison: PropTypes.bool,
  hasPoisonSrc: PropTypes.string
};

MechanicIcon.defaultProps = {
  hasBoon: false,
  hasDoubleAttack: false,
  hasEventListener: false,
  hasOnDeath: false,
  hasPoison: false
};

export default MechanicIcon;
