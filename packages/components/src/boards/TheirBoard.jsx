import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS, THEIR_INTERACTION_KEYS as intKeys } from '@ccg/enums';
import { BoardSlot } from '@ccg/components';
import { usePrevious } from '@ccg/hooks';

const TheirBoard = props => {
  const {
    G,
    ctx,
    moves,
    moves: {
      attackMinionWithMinion,
      attackMinionWithOnPlay,
      attackMinionWithPlayer,
      attackMinionWithSpell
    },
    theirBoard,
    theirID,
    yourID,
    interactionImages,
    mechanicImages,
    uiTooltipSrc
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

  const intClick = useCallback(
    (key, slotIndexClicked) => {
      switch (key) {
        case intKeys[1]:
          return attackMinionWithMinion(slotIndexClicked);
        case intKeys[2]:
          return attackMinionWithOnPlay(slotIndexClicked);
        case intKeys[3]:
          return attackMinionWithPlayer(slotIndexClicked);
        case intKeys[4]:
          return attackMinionWithSpell(slotIndexClicked);
        default:
          return;
      }
    },
    [
      attackMinionWithMinion,
      attackMinionWithOnPlay,
      attackMinionWithPlayer,
      attackMinionWithSpell
    ]
  );

  return (
    <div
      className="player__board their__board"
      data-board={PLAYER_BOARDS[2]}
      data-board-id={theirID}
      data-board-length={theirBoardArray.length}
    >
      <div className="play__area">
        {theirBoardArray.map((object, index) => {
          return (
            <BoardSlot
              G={G}
              ctx={ctx}
              moves={moves}
              board={PLAYER_BOARDS[2]}
              handleCanBeAttackedByMinionFn={() => intClick(intKeys[1], index)}
              handleCanBeAttackedByOnPlayFn={() => intClick(intKeys[2], index)}
              handleCanBeAttackedByPlayerFn={() => intClick(intKeys[3], index)}
              handleCanBeAttackedBySpellFn={() => intClick(intKeys[4], index)}
              index={index}
              interactionImages={interactionImages}
              key={`slot_${index}`}
              mechanicImages={mechanicImages}
              playerID={theirID}
              slotObject={object}
              uiTooltipSrc={uiTooltipSrc}
              boardLength={theirBoardArray.length}
              {...props}
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
