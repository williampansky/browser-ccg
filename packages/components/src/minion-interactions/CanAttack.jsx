import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import { INTERACTIONS } from '@ccg/images';
import { getMinionInteractionImage } from '@ccg/utils/src';

export default function CanAttack(props) {
  const {
    activeState,
    handleCanAttackFunction,
    hasBulwark,
    canAttackSrc,
    canAttackBulwarkSrc
  } = props;

  const [styles, set, stop] = useSpring(() => ({
    opacity: 1,
    pointerEvents: 'auto'
  }));

  const handleStyleSet = useCallback(
    bool => {
      set({
        opacity: bool ? 1 : 0,
        pointerEvents: bool ? 'auto' : 'none'
      });
    },
    [set]
  );

  useEffect(() => {
    handleStyleSet(activeState);
    return () => stop();
  }, [handleStyleSet, activeState, set, stop]);

  return (
    <animated.div
      className="minion__interaction minion__interaction--can-attack"
      data-component="minion-interactions/CanAttack"
      onClick={handleCanAttackFunction}
      onKeyPress={handleCanAttackFunction}
      role="button"
      tabIndex={0}
      style={styles}
    >
      {hasBulwark ? (
        <img alt="" role="presentation" src={canAttackBulwarkSrc} />
      ) : (
        <img alt="" role="presentation" src={canAttackSrc} />
      )}
    </animated.div>
  );
}

CanAttack.propTypes = {
  handleCanAttackFunction: PropTypes.func
};

CanAttack.defaultProps = {
  handleCanAttackFunction: () => {},
  hasBulwark: false
};
