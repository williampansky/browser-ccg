import React from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { BoardSlot } from '@ccg/components';

const TheirBoard = props => {
  const { G, ctx, moves, theirBoard, theirID } = props;

  return (
    <div
      className="player__board their__board"
      data-board={PLAYER_BOARDS[2]}
      data-board-id={theirID}
    >
      <div className="play__area">
        {theirBoard.map((object, index) => {
          index = index + 1;
          return (
            <BoardSlot
              key={`slot_${index}`}
              board={PLAYER_BOARDS[1]}
              slotObject={object}
              index={index}
              playerID={theirID}
              // onClick={() => handleClick(index)}
            />
          );
        })}
        <div className="board__slot__spacer" />
      </div>
    </div>
  );
};

TheirBoard.propTypes = {
  theirID: PropTypes.string.isRequired,
  theirBoard: PropTypes.array
};

TheirBoard.defaultProps = {
  theirBoard: []
};

export default TheirBoard;
