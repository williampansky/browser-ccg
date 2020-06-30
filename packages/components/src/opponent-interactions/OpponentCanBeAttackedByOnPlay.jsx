import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

export default function OpponentCanBeAttackedByOnPlay(props) {
  const { activeState, onClick } = props;

  const [styles, set, stop] = useSpring(() => ({
    boxShadow: 'var(--box-shadow-can-be-attacked)',
    opacity: 0,
    pointerEvents: 'none'
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
  }, [handleStyleSet, activeState, stop]);

  return (
    <animated.div
      className="opponent__interaction opponent__interaction--can-be-attacked"
      data-file="opponent-interactions/CanBeAttackedByOnPlay"
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
      style={styles}
    />
  );
}

OpponentCanBeAttackedByOnPlay.propTypes = {
  activeState: PropTypes.bool,
  onClick: PropTypes.func
};

OpponentCanBeAttackedByOnPlay.defaultProps = {
  activeState: false,
  onClick: () => {}
};
