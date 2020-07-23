import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

// https://codepen.io/vineethtr/pen/qdKXeB?editors=0100
export default function WillExpire({ active }) {
  const [styles, set, stop] = useSpring(() => ({
    opacity: 0
  }));

  const handleStyleSet = useCallback(
    bool => {
      set({
        opacity: bool ? 1 : 0
      });
    },
    [set]
  );

  useEffect(() => {
    handleStyleSet(active);
    return () => stop();
  }, [handleStyleSet, active, set, stop]);

  return (
    <animated.div
      className="minion__mechanics minion--will-expire"
      data-component="mechanics/WillExpire"
      style={styles}
    >
      <div />
    </animated.div>
  );
}

WillExpire.propTypes = {
  active: PropTypes.bool
};

WillExpire.defaultProps = {
  active: false
};
