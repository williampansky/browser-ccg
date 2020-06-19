import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { TheirBoard, YourBoard } from '@ccg/components';
import styles from './styles.module.scss';

const Board = props => {
  const {
    G,
    ctx,
    moves,
    theirBoard,
    theirID,
    yourBoard,
    yourID,
    cardIsSelected,
    cardIsLocked
  } = props;

  return (
    <div className={styles['board']} data-component="Board">
      <TheirBoard
        G={G}
        ctx={ctx}
        moves={moves}
        theirBoard={theirBoard}
        theirID={theirID}
      />

      <YourBoard
        G={G}
        ctx={ctx}
        moves={moves}
        yourBoard={yourBoard}
        yourID={yourID}
        cardIsSelected={cardIsSelected}
        cardIsLocked={cardIsLocked}
      />
    </div>
  );
};

Board.propTypes = {
  theirID: PropTypes.string.isRequired,
  theirBoard: PropTypes.array,
  yourID: PropTypes.string.isRequired,
  yourBoard: PropTypes.array
};

Board.defaultProps = {
  theirBoard: [],
  yourBoard: [],
  cardIsSelected: false
};

export default Board;
