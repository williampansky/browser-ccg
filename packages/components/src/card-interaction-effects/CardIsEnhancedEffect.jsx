import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

export default function CardIsEnhancedEffect(props) {
  const { activeState } = props;

  const [styles, set, stop] = useSpring(() => ({
    boxShadow: 'var(--box-shadow-is-selected)',
    opacity: 0
  }));

  const handleStyleSet = useCallback(
    bool => {
      set({ opacity: bool ? 1 : 0 });
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
      data-file="card-interaction-effects/CardIsEnhancedEffect"
      role="presentation"
      style={styles}
    />
  );
}

CardIsEnhancedEffect.propTypes = {
  activeState: PropTypes.bool
};

CardIsEnhancedEffect.defaultProps = {
  activeState: false
};
