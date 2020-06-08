import React from 'react';
import PropTypes from 'prop-types';

export default function ResizeObserver({ moves }) {
  const { setGameResolution } = moves;
  return <div data-file="game-wrapper/ResizeObserver" hidden="" />;
}

ResizeObserver.propTypes = {
  moves: PropTypes.object
};
