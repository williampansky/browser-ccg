import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { BoardSlot } from '@ccg/components';

const TheirBoard = props => {
  const {
    G,
    ctx,
    moves,
    moves: { attackMinionWithMinion },
    theirBoard,
    theirID
  } = props;

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
        {theirBoard.map((object, index) => {
          return (
            <BoardSlot
              G={G}
              ctx={ctx}
              moves={moves}
              key={`slot_${index}`}
              board={PLAYER_BOARDS[2]}
              slotObject={object}
              index={index}
              playerID={theirID}
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
