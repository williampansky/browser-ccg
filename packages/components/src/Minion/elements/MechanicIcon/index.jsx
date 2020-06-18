import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getMechanicImage } from '@ccg/utils';

const MechanicIcon = ({
  hasDoubleAttack,
  hasEventListener,
  hasOnDeath,
  hasPoison,
  mechanicImages
}) => {
  function getDataLength() {
    let num = 0;
    if (hasOnDeath) num = num + 1;
    if (hasDoubleAttack) num = num + 1;
    if (hasPoison) num = num + 1;
    return num;
  }

  if (hasOnDeath) {
    return (
      <div className={styles['minion__mechanics']}>
        <img
          alt="hasOnDeath"
          src={getMechanicImage('ON_DEATH.png', mechanicImages)}
        />
      </div>
    );
  } else if (hasEventListener) {
    return (
      <div className={styles['minion__mechanics']}>
        <img
          alt="hasEventListener"
          src={getMechanicImage('EVENT.png', mechanicImages)}
        />
      </div>
    );
  } else if (hasPoison) {
    return (
      <div className={styles['minion__mechanics']}>
        <img
          alt="hasPoison"
          src={getMechanicImage('POISON.png', mechanicImages)}
        />
      </div>
    );
  } else if (hasDoubleAttack) {
    return (
      <div className={styles['minion__mechanics']}>
        <img
          alt="hasDoubleAttack"
          src={getMechanicImage('DOUBLE_ATTACK.png', mechanicImages)}
        />
      </div>
    );
  } else {
    return null;
  }

  // return (
  //   <div className={styles.component} data-length={getDataLength()}>
  //     {hasOnDeath ? (
  //       <img alt="hasOnDeath" src="/images/mechanics/ON_DEATH.png" />
  //     ) : null}

  //     {hasEventListener ? (
  //       <img alt="hasEventListener" src="/images/mechanics/EVENT.png" />
  //     ) : null}

  //     {hasPoison ? (
  //       <img alt="hasPoison" src="/images/mechanics/POISON.png" />
  //     ) : null}

  //     {hasDoubleAttack ? (
  //       <img alt="hasDoubleAttack" src="/images/mechanics/DOUBLE_ATTACK.png" />
  //     ) : null}
  //   </div>
  // );
};

MechanicIcon.propTypes = {
  hasOnDeath: PropTypes.bool,
  hasEventListener: PropTypes.bool,
  hasDoubleAttack: PropTypes.bool,
  hasPoison: PropTypes.bool,
  mechanicImages: PropTypes.object.isRequired
};

MechanicIcon.defaultProps = {
  hasOnDeath: false,
  hasEventListener: false,
  hasDoubleAttack: false,
  hasPoison: false
};

export default MechanicIcon;
