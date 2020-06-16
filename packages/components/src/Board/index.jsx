import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { BoardDropArea } from '@ccg/components';
import styles from './styles.module.scss';

const Board = props => {
  const {
    theirBoard,
    theirId,
    yourBoard,
    yourId,
    cardIsSelected,
    handleDropAreaClick
  } = props;

  return (
    <div className={styles['board']} data-component="Board">
      <div
        className={[styles['player__board'], styles['their__board']].join(' ')}
        data-board={PLAYER_BOARDS[2]}
        data-board-id={theirId}
      >
        {Object.keys(theirBoard).map((key, index) => {
          index = index + 1;
          // console.log(index, yourBoard[key]);
          return <Fragment key={index}>{index}</Fragment>;
        })}
      </div>

      <div
        className={[styles['player__board'], styles['your__board']].join(' ')}
        data-board={PLAYER_BOARDS[1]}
        data-board-id={yourId}
      >
        <div className={styles['play__area']}>
          {yourBoard.length <= 6 ? (
            <BoardDropArea
              index={0}
              boardIsActive={cardIsSelected}
              areaIsAlone={cardIsSelected && yourBoard.length === 0}
              onClick={() => handleDropAreaClick(0)}
            />
          ) : null}
          {yourBoard.map((key, index) => {
            index = index + 1;
            // console.log(index, yourBoard[key]);
            return <Fragment key={index}>{index}</Fragment>;
          })}
        </div>
      </div>
    </div>
  );
};

Board.propTypes = {
  theirId: PropTypes.string.isRequired,
  theirBoard: PropTypes.object,
  yourId: PropTypes.string.isRequired,
  yourBoard: PropTypes.array
};

Board.defaultProps = {
  theirBoard: {},
  yourBoard: []
};

export default Board;
