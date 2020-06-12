import React from 'react';
import PropTypes from 'prop-types';

export default function BoardDropArea({
  areaIsAlone,
  boardIsActive,
  index,
  onClick
}) {
  return (
    <div
      data-file="board-drop-areas/BoardDropArea"
      data-index={index}
      className={[
        'drop-area',
        boardIsActive ? 'board-is-active' : '',
        areaIsAlone ? 'area-is-alone' : ''
      ].join(' ')}
      onClick={onClick}
    ></div>
  );
}

BoardDropArea.propTypes = {
  areaIsAlone: PropTypes.bool,
  boardIsActive: PropTypes.bool,
  index: PropTypes.number,
  onClick: PropTypes.func
};
