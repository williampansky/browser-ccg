import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { BoardSlot } from '@ccg/components';
import { usePrevious } from '@ccg/hooks';

const TheirBoard = props => {
  const {
    G,
    ctx,
    moves,
    moves: { attackMinionWithMinion },
    theirBoard,
    theirID,
    interactionImages,
    mechanicImages
  } = props;

  const [theirBoardArray, setTheirBoardArray] = useState([]);
  const theirPreviousBoardArray = usePrevious(theirBoardArray);

  const handleTheirBoardArrayCallback = useCallback(
    array => {
      if (array !== theirPreviousBoardArray) return setTheirBoardArray(array);
    },
    [theirPreviousBoardArray]
  );

  useEffect(() => {
    handleTheirBoardArrayCallback(theirBoard);
  }, [handleTheirBoardArrayCallback, theirBoard]);

  const handleCanBeAttackedByMinionFunction = useCallback(
    slotIndexClicked => {
      return attackMinionWithMinion(slotIndexClicked);
    },
    [attackMinionWithMinion]
  );

  return (
    <div
      className="player__board their__board"
      data-board={PLAYER_BOARDS[2]}
      data-board-id={theirID}
    >
      <div className="play__area">
        {theirBoardArray.map((object, index) => {
          return (
            <BoardSlot
              key={`slot_${index}`}
              board={PLAYER_BOARDS[2]}
              slotObject={object}
              index={index}
              playerID={theirID}
              interactionImages={interactionImages}
              mechanicImages={mechanicImages}
              handleCanBeAttackedByMinionFunction={() =>
                handleCanBeAttackedByMinionFunction(index)
              }
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
