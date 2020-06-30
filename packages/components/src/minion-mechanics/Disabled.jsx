import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

export default function Disabled({ active, src }) {
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
      className="minion--is-disabled"
      data-component="mechanics/Disabled"
      style={styles}
    >
      <img alt="" role="presentation" src={src} />
    </animated.div>
  );
}

Disabled.propTypes = {
  active: PropTypes.bool,
  src: PropTypes.string.isRequired
};

Disabled.defaultProps = {
  active: false
};
