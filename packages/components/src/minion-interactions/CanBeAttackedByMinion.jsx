import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

export default function CanBeAttackedByMinion(props) {
  const { onClick } = props;
  const [styles, set, stop] = useSpring(() => ({
    background: 'var(--box-shadow-can-be-attacked-color)',
    opacity: 0
  }));

  useEffect(() => {
    set({ opacity: 1 });
    return () => stop();
  }, [set, stop]);

  return (
    <animated.div
      className="minion__interaction minion__interaction--can-be-attacked"
      data-file="minion-interactions/CanBeAttackedByMinion"
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
      style={styles}
    />
  );
}

CanBeAttackedByMinion.propTypes = {
  onClick: PropTypes.func
};

CanBeAttackedByMinion.defaultProps = {
  onClick: () => {}
};
