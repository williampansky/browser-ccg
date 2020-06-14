import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { MECHANICS, SETS } from '@ccg/images';
import { getMinionFlairImage } from '@ccg/utils';

const Board = ({ theirBoard, theirId, yourBoard, yourId }) => {
  return (
    <div className={styles['board']} data-component="Board">
      <div
        className={[styles['player__board'], styles['their__board']].join(' ')}
        data-board-id={theirId}
      >
        {/* {Object.keys(theirBoard).map((obj, idx) => {
          return <div key={idx}>{idx}</div>;
        })} */}
      </div>
      <div
        className={[styles['player__board'], styles['your__board']].join(' ')}
        data-board-id={yourId}
      >
        <div className={styles['play__area']}>
          {Object.keys(yourBoard).map((key, index) => {
            index = index + 1;
            console.log(index, yourBoard[key]);
            return <Fragment key={index}></Fragment>;
          })}
        </div>
      </div>
    </div>
  );
};

Board.propTypes = {
  theirId: PropTypes.string.isRequired,
  yourId: PropTypes.string.isRequired
};

export default Board;
