import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';

const PlayerInteractionLayer = props => {
  const { children, handlePlayerInteractionClick, parentComponent } = props;

  return (
    <div
      className={[styles['player__interaction__layer']].join(' ')}
      data-component="PlayerInteractionLayer"
      data-player={parentComponent}
      onClick={handlePlayerInteractionClick}
      onKeyPress={handlePlayerInteractionClick}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
};

PlayerInteractionLayer.propTypes = {
  children: PropTypes.node.isRequired,
  handlePlayerInteractionClick: PropTypes.func,
  parentComponent: PropTypes.string.isRequired
};

PlayerInteractionLayer.defaultProps = {
  handlePlayerInteractionClick: () => {}
};

export default PlayerInteractionLayer;
