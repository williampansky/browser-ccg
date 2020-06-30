import React, { Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS, YOUR_INTERACTION_KEYS as intKeys } from '@ccg/enums';
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
    mechanicImages,
    uiTooltipSrc
  } = props;

  const { deselectMinion, playMinionCard, selectMinion } = moves;

  const handleDropAreaClick = useCallback(
    slotIndexClicked => {
      return playMinionCard(slotIndexClicked);
    },
    [playMinionCard]
  );

  const intClick = useCallback(
    (key, slotObjectClicked, slotIndexClicked) => {
      switch (key) {
        case intKeys[1]:
          return selectMinion(slotObjectClicked, slotIndexClicked);
        case intKeys[2]:
          return deselectMinion();
        default:
          return;
      }
    },
    [selectMinion, deselectMinion]
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
                board={PLAYER_BOARDS[1]}
                ctx={ctx}
                G={G}
                handleCanAttackFn={() => intClick(intKeys[1], object, index)}
                handleIsAttackingFn={() => intClick(intKeys[2])}
                index={index}
                interactionImages={interactionImages}
                key={`slot_${index}`}
                mechanicImages={mechanicImages}
                moves={moves}
                playerID={yourID}
                slotObject={object}
                uiTooltipSrc={uiTooltipSrc}
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
