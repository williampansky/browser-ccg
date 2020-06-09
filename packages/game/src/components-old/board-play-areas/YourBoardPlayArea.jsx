import React from 'react';
import PropTypes from 'prop-types';

// child components
import BoardDropArea from '../board-drop-areas/BoardDropArea';
import BoardSlot from '../board-slots/BoardSlot';

export default function YourBoardPlayerArea({
  G,
  ctx,
  moves,
  isActive,
  board,
  theirID,
  yourID
}) {
  const { boards, selectedCardObject } = G;
  const { playCard } = moves;

  const THEIR_BOARD_LENGTH = G.boards[theirID].length;
  const SELECTED_CARD_OBJECT = selectedCardObject[yourID];

  const CARD_ID = SELECTED_CARD_OBJECT && SELECTED_CARD_OBJECT.id;
  const CARD_UUID = SELECTED_CARD_OBJECT && SELECTED_CARD_OBJECT.uuid;
  const CARD_TYPE = SELECTED_CARD_OBJECT && SELECTED_CARD_OBJECT.type;
  const CARD_SPELLTYPE = SELECTED_CARD_OBJECT && SELECTED_CARD_OBJECT.spellType;

  const CARD_IS_SELECTED = SELECTED_CARD_OBJECT !== null;
  const BOARD_IS_ACTIVE =
    CARD_IS_SELECTED && CARD_TYPE === 'MINION' && CARD_SPELLTYPE !== 'GLOBAL';

  function handleClick(index, uuid = CARD_UUID, id = CARD_ID) {
    if (boards[yourID][index]) return;
    return playCard(index, uuid, id);
  }

  function dropMinion(index, uuid = CARD_UUID, id = CARD_ID) {
    return playCard(index, uuid, id);
  }

  return (
    <React.Fragment>
      <div
        data-file="board-play-areas/YourBoardPlayArea"
        data-is-your-turn={isActive}
        data-their-board-length={THEIR_BOARD_LENGTH}
        data-your-board-length={boards[yourID].length}
        className={[
          'board-play-area',
          'your-board-play-area',
          BOARD_IS_ACTIVE ? 'board-is-active' : ''
        ].join(' ')}
      >
        {boards[yourID].length <= 6 ? (
          <BoardDropArea
            index={0}
            boardIsActive={BOARD_IS_ACTIVE}
            areaIsAlone={CARD_IS_SELECTED && boards[yourID].length === 0}
            onClick={() => dropMinion(0)}
          />
        ) : null}
        {boards[yourID].map((card, index) => {
          return (
            <React.Fragment key={`fragment_${index}`}>
              <BoardSlot
                key={`slot_${index}`}
                G={G}
                ctx={ctx}
                moves={moves}
                board={board}
                isActive={isActive}
                data={card}
                index={index}
                yourID={yourID}
                onClick={() => handleClick(index)}
              />
              {boards[yourID].length <= 6 ? (
                <BoardDropArea
                  index={index + 1}
                  boardIsActive={BOARD_IS_ACTIVE}
                  onClick={() => dropMinion(index + 1)}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </React.Fragment>
  );
}

YourBoardPlayerArea.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  theirID: PropTypes.string,
  yourID: PropTypes.string,
  board: PropTypes.string
};
