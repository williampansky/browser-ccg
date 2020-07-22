import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import { INTERACTIONS } from '@ccg/images';
import { getMinionInteractionImage } from '@ccg/utils/src';

export default function IsAttacking(props) {
  const {
    activeState,
    slotObject: { hasBulwark },
    interactionImages: { isAttackingSrc, isAttackingBulwarkSrc },
    onClick
  } = props;

  const [styles, set, stop] = useSpring(() => ({
    opacity: 0,
    pointerEvents: 'none',
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
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
      style={styles}
    >
      {hasBulwark ? (
        <img alt="" role="presentation" src={isAttackingBulwarkSrc} />
      ) : (
        <img alt="" role="presentation" src={isAttackingSrc} />
      )}
    </animated.div>
  );
}

IsAttacking.propTypes = {
  activeState: PropTypes.bool,
  onClick: PropTypes.func
};

IsAttacking.defaultProps = {
  activeState: false,
  onClick: () => {}
};
