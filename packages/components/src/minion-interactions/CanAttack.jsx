import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';

export default function CanAttack(props) {
  const { handleCanAttackFunction } = props;
  const [styles, set, stop] = useSpring(() => ({
    background: 'var(--box-shadow-can-be-selected-color)',
    opacity: 0
  }));

  useEffect(() => {
    set({ opacity: 1 });
    return () => stop();
  }, [set, stop]);

  return (
    <animated.div
      className="minion__interaction minion__interaction--can-attack"
      data-component="minion-interactions/CanAttack"
      onClick={handleCanAttackFunction}
      onKeyPress={handleCanAttackFunction}
      role="button"
      tabIndex={0}
      style={styles}
    />
  );
}

CanAttack.propTypes = {
  handleCanAttackFunction: PropTypes.func
};

CanAttack.defaultProps = {
  handleCanAttackFunction: () => {}
};
