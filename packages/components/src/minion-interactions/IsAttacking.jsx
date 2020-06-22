import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

export default function IsAttacking(props) {
  const { handleIsAttackingFunction } = props;
  const [styles, set, stop] = useSpring(() => ({
    background: 'var(--box-shadow-is-selected-color)',
    opacity: 0,
    transform: 'scale(1)'
  }));

  useEffect(() => {
    set({ opacity: 1, transform: 'scale(1.15)' });
    return () => stop();
  }, [set, stop]);

  return (
    <animated.div
      className="minion__interaction minion__interaction--is-attacking"
      data-component="minion-interactions/IsAttacking"
      onClick={handleIsAttackingFunction}
      onKeyPress={handleIsAttackingFunction}
      role="button"
      tabIndex={0}
      style={styles}
    />
  );
}

IsAttacking.propTypes = {
  handleIsAttackingFunction: PropTypes.func
};

IsAttacking.defaultProps = {
  handleIsAttackingFunction: () => {}
};
