import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { TheirBoard, YourBoard } from '@ccg/components';
import styles from './styles.module.scss';
import { getMechanicImage } from '@ccg/utils';

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
    cardIsLocked,
    mechanicImages
  } = props;

  const { selectedMinionObject } = G;
  const boonSrc = getMechanicImage('BOON.png', mechanicImages);
  const bubbleSrc = getMechanicImage('BUBBLE.png', mechanicImages);
  const doubleAttackSrc = getMechanicImage('DOUBLE_ATTACK.png', mechanicImages);
  const eventListenerSrc = getMechanicImage('EVENT.png', mechanicImages);
  const onDeathSrc = getMechanicImage('ON_DEATH.png', mechanicImages);
  const poisonSrc = getMechanicImage('POISON.png', mechanicImages);

  return (
    <div className={styles['board']} data-component="Board">
      <TheirBoard
        G={G}
        ctx={ctx}
        moves={moves}
        theirBoard={theirBoard}
        theirID={theirID}
        playerBoard={PLAYER_BOARDS[2]}
        mechanicImages={{
          hasBoonSrc: boonSrc,
          hasBubbleSrc: bubbleSrc,
          hasDoubleAttackSrc: doubleAttackSrc,
          hasEventListenerSrc: eventListenerSrc,
          hasOnDeathSrc: onDeathSrc,
          hasPoisonSrc: poisonSrc
        }}
      />

      <YourBoard
        G={G}
        ctx={ctx}
        moves={moves}
        yourBoard={yourBoard}
        yourID={yourID}
        playerBoard={PLAYER_BOARDS[1]}
        cardIsSelected={cardIsSelected}
        cardIsLocked={cardIsLocked}
        minionIsSelected={selectedMinionObject[yourID] ? true : false}
        mechanicImages={{
          hasBoonSrc: boonSrc,
          hasBubbleSrc: bubbleSrc,
          hasDoubleAttackSrc: doubleAttackSrc,
          hasEventListenerSrc: eventListenerSrc,
          hasOnDeathSrc: onDeathSrc,
          hasPoisonSrc: poisonSrc
        }}
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
