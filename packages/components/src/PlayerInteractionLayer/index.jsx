import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSpring, animated } from 'react-spring';
import styles from './styles.module.scss';

const PlayerInteractionLayer = props => {
  const { handlePlayerInteractionClick, parentComponent } = props;

  const [inlineStyles, set, stop] = useSpring(() => ({
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
    handleStyleSet(false);
    return () => stop();
  }, [handleStyleSet, stop]);

  return (
    <animated.div
      className={[styles['player__interaction__layer']].join(' ')}
      data-component="PlayerInteractionLayer"
      data-player={parentComponent}
      onClick={handlePlayerInteractionClick}
      onKeyPress={handlePlayerInteractionClick}
      role="button"
      tabIndex={0}
      style={inlineStyles}
    >
      <div></div>
    </animated.div>
  );
};

PlayerInteractionLayer.propTypes = {
  handlePlayerInteractionClick: PropTypes.func,
  parentComponent: PropTypes.string.isRequired
};

PlayerInteractionLayer.defaultProps = {
  handlePlayerInteractionClick: () => {}
};

export default PlayerInteractionLayer;
