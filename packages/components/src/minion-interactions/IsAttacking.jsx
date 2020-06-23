import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import { INTERACTIONS } from '@ccg/images';
import { getMinionInteractionImage } from '@ccg/utils/src';

export default function IsAttacking(props) {
  const { activeState, handleIsAttackingFunction, hasBulwark } = props;
  const [styles, set, stop] = useSpring(() => ({
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'scale(1.15)'
  }));

  const handleStyleSet = useCallback(
    bool => {
      set({
        opacity: bool ? 1 : 0,
        pointerEvents: bool ? 'auto' : 'none',
        transform: bool ? 'scale(1.15)' : 'scale(1)'
      });
    },
    [set]
  );

  useEffect(() => {
    handleStyleSet(activeState);
    return () => stop();
  }, [handleStyleSet, activeState, stop]);

  return (
    <animated.div
      className="minion__interaction minion__interaction--is-attacking"
      data-component="minion-interactions/IsAttacking"
      onClick={handleIsAttackingFunction}
      onKeyPress={handleIsAttackingFunction}
      role="button"
      tabIndex={0}
      style={styles}
    >
      {hasBulwark ? (
        <img src={getMinionInteractionImage('IsAttacking--Bulwark.png')} />
      ) : (
        <img src={getMinionInteractionImage('IsAttacking--Default.png')} />
      )}
    </animated.div>
  );
}

IsAttacking.propTypes = {
  activeState: PropTypes.bool,
  handleIsAttackingFunction: PropTypes.func
};

IsAttacking.defaultProps = {
  activeState: false,
  handleIsAttackingFunction: () => {},
  hasBulwark: false
};
