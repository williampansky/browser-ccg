import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS } from '@ccg/enums';
import { TheirBoard, YourBoard } from '@ccg/components';
import styles from './styles.module.scss';
import {
  getMechanicImage as gMI,
  getMinionInteractionImage as gII
} from '@ccg/utils';

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

  const mechImages = {
    bubbleSrc: gMI('BUBBLE.png'),
    boonSrc: gMI('BOON.png'),
    eventListenerSrc: gMI('EVENT.png'),
    doubleAttackSrc: gMI('DOUBLE_ATTACK.png'),
    poisonSrc: gMI('POISON.png'),
    onDeathSrc: gMI('ON_DEATH.png')
  };

  const intImages = {
    canBeAttacked: gII('CanBeAttacked--Default.png'),
    canBeAttackedBulwark: gII('CanBeAttacked--Default--Bulwark.png'),
    canBeAttackedLocation: gII('CanBeAttacked--Location.png'),
    canBeAttackedLocationBulwark: gII('CanBeAttacked--Location--Bulwark.png'),
    canAttack: gII('CanAttack--Default.png'),
    canAttackBulwark: gII('CanAttack--Bulwark.png'),
    isAttacking: gII('IsAttacking--Default.png'),
    isAttackingBulwark: gII('IsAttacking--Bulwark.png')
  };

  return (
    <div className={styles['board']} data-component="Board">
      <TheirBoard
        G={G}
        ctx={ctx}
        moves={moves}
        theirBoard={theirBoard}
        theirID={theirID}
        playerBoard={PLAYER_BOARDS[2]}
        interactionImages={{
          canBeAttackedSrc: intImages.canBeAttacked,
          canBeAttackedBulwarkSrc: intImages.canBeAttackedBulwark,
          canBeAttackedLocSrc: intImages.canBeAttackedLocation,
          canBeAttackedLocBulwarkSrc: intImages.canBeAttackedLocationBulwark
        }}
        mechanicImages={{
          hasBoonSrc: mechImages.boonSrc,
          hasBubbleSrc: mechImages.bubbleSrc,
          hasDoubleAttackSrc: mechImages.doubleAttackSrc,
          hasEventListenerSrc: mechImages.eventListenerSrc,
          hasOnDeathSrc: mechImages.onDeathSrc,
          hasPoisonSrc: mechImages.poisonSrc
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
        interactionImages={{
          canAttackSrc: intImages.canAttack,
          canAttackBulwarkSrc: intImages.canAttackBulwark,
          isAttackingSrc: intImages.isAttacking,
          isAttackingBulwarkSrc: intImages.isAttackingBulwark
        }}
        mechanicImages={{
          hasBoonSrc: mechImages.boonSrc,
          hasBubbleSrc: mechImages.bubbleSrc,
          hasDoubleAttackSrc: mechImages.doubleAttackSrc,
          hasEventListenerSrc: mechImages.eventListenerSrc,
          hasOnDeathSrc: mechImages.onDeathSrc,
          hasPoisonSrc: mechImages.poisonSrc
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
