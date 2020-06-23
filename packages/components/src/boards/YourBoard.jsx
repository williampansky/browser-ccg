import React, { Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { BoardDropArea, BoardSlot } from '@ccg/components';

const YourBoard = props => {
  const {
    G,
    ctx,
    moves,
    yourBoard,
    yourID,
    cardIsSelected,
    cardIsLocked,
    minionIsSelected,
    interactionImages,
    mechanicImages
  } = props;

  const { deselectMinion, playMinionCard, selectMinion } = moves;

  const handleDropAreaClick = useCallback(
    slotIndexClicked => {
      return playMinionCard(slotIndexClicked);
    },
    [playMinionCard]
  );

  return (
    <div
      className={[
        'player__board',
        'your__board',
        cardIsLocked ? 'board--is-active' : ''
      ].join(' ')}
      data-board={PLAYER_BOARDS[1]}
      data-board-id={yourID}
      data-component="YourBoard"
    >
      <div className="play__area">
        <div className="board__slot__spacer" />

        {yourBoard.length <= 6 ? (
          <BoardDropArea
            index={0}
            boardIsActive={cardIsLocked}
            areaIsAlone={cardIsLocked && yourBoard.length === 0}
            onClick={() => handleDropAreaClick(0)}
          />
        ) : null}

        {yourBoard.map((object, index) => {
          return (
            <Fragment key={`fragment_${index}`}>
              <BoardSlot
                G={G}
                ctx={ctx}
                moves={moves}
                key={`slot_${index}`}
                board={PLAYER_BOARDS[1]}
                slotObject={object}
                index={index}
                playerID={yourID}
                handleCanAttackFunction={() => selectMinion(object, index)}
                handleIsAttackingFunction={() => deselectMinion()}
                interactionImages={interactionImages}
                mechanicImages={mechanicImages}
              />

              {yourBoard.length <= 6 ? (
                <BoardDropArea
                  index={index + 1}
                  boardIsActive={cardIsLocked}
                  onClick={() => handleDropAreaClick(index + 1)}
                />
              ) : null}
            </Fragment>
          );
        })}

        <div className="board__slot__spacer" />
      </div>
    </div>
  );
};

YourBoard.propTypes = {
  yourID: PropTypes.string.isRequired,
  yourBoard: PropTypes.array,
  handleDropAreaClick: PropTypes.func,
  cardIsSelected: PropTypes.bool
};

YourBoard.defaultProps = {
  yourBoard: [],
  handleDropAreaClick: () => {},
  cardIsSelected: false,
  cardIsLocked: false
};

export default YourBoard;
