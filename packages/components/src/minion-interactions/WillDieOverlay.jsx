import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import { INTERACTIONS } from '@ccg/images';
import { getMinionInteractionImage } from '@ccg/utils/src';

export default function WillDieOverlay(props) {
  const { activeState, isAttacking, willDieSrc } = props;
  const [styles, set, stop] = useSpring(() => ({
    opacity: 0,
    pointerEvents: 'none',
    transform: 'scale(0)',
    zIndex: 100,
    config: {
      duration: 160
    }
  }));

  const handleStyleSet = useCallback(
    bool => {
      set({
        opacity: bool ? 1 : 0,
        transform: bool
          ? isAttacking
            ? 'scale(1.15)'
            : 'scale(1)'
          : 'scale(0)'
      });
    },
    [isAttacking, set]
  );

  useEffect(() => {
    handleStyleSet(activeState);
    return () => stop();
  }, [handleStyleSet, activeState, stop]);

  return (
    <animated.div
      className="minion__interaction minion__interaction--will-die"
      data-component="minion-interactions/WillDieOverlay"
      style={styles}
    >
      <img
        alt=""
        role="presentation"
        src={willDieSrc}
        style={{ imageRendering: 'pixelated', transform: 'scale(1)' }}
      />
    </animated.div>
  );
}

WillDieOverlay.propTypes = {
  activeState: PropTypes.bool,
  isAttacking: PropTypes.bool,
  willDieSrc: PropTypes.string.isRequired
};

WillDieOverlay.defaultProps = {
  activeState: false,
  isAttacking: false
};
