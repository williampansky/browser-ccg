import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

export default function CardIsPlayableEffect(props) {
  const { activeState } = props;

  const [styles, set, stop] = useSpring(() => ({
    boxShadow: 'var(--box-shadow-can-be-selected)',
    opacity: 0
  }));

  const handleStyleSet = useCallback(
    bool => {
      setTimeout(() => {
        set({ opacity: bool ? 1 : 0 });
      }, 200);
    },
    [set]
  );

  useEffect(() => {
    handleStyleSet(activeState);
    return () => stop();
  }, [handleStyleSet, activeState, stop]);

  return (
    <animated.div
      className="card__effect"
      data-file="card-interaction-effects/CardIsPlayableEffect"
      role="presentation"
      style={styles}
    />
  );
}

CardIsPlayableEffect.propTypes = {
  activeState: PropTypes.bool
};

CardIsPlayableEffect.defaultProps = {
  activeState: false
};
