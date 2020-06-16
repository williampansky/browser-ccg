import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { BoardDropArea } from '@ccg/components';
import styles from './styles.module.scss';

const Board = props => {
  const {
    theirBoard,
    theirID,
    yourBoard,
    yourID,
    cardIsSelected,
    handleDropAreaClick
  } = props;

  return (
    <div className={styles['board']} data-component="Board">
      <div
        className={[styles['player__board'], styles['their__board']].join(' ')}
        data-board={PLAYER_BOARDS[2]}
        data-board-id={theirID}
      >
        {theirBoard.map((obj, index) => {
          index = index + 1;
          // console.log(obj);
          // return <Fragment key={index}>{obj.minionData.name}</Fragment>;
        })}
      </div>

      <div
        className={[styles['player__board'], styles['your__board']].join(' ')}
        data-board={PLAYER_BOARDS[1]}
        data-board-id={yourID}
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
          {/* {yourBoard.map((obj, index) => {
            index = index + 1;
            return <Fragment key={index}>{index}</Fragment>;
          })} */}
        </div>
      </div>
    </div>
  );
};

Board.propTypes = {
  theirID: PropTypes.string.isRequired,
  theirBoard: PropTypes.array,
  yourID: PropTypes.string.isRequired,
  yourBoard: PropTypes.array,
  handleDropAreaClick: PropTypes.func
};

Board.defaultProps = {
  theirBoard: [],
  yourBoard: [],
  handleDropAreaClick: () => {},
  cardIsSelected: false
};

export default Board;
