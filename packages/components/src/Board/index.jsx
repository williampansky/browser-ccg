import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS, PLAY_TYPE } from '@ccg/enums';
import { TheirBoard, YourBoard, CardPlayArea } from '@ccg/components';
import styles from './styles.module.scss';
import {
  getMechanicImage as gMI,
  getMinionInteractionImage as gII,
  getUiImage
} from '@ccg/utils';

const Board = props => {
  const {
    G,
    G: { selectedCardPlayType, selectedMinionObject, selectedCardObject },
    ctx,
    moves,
    moves: { playGlobalSpellCard },
    theirBoard,
    theirID,
    yourBoard,
    yourID,
    cardIsSelected,
    cardIsLocked,
    mechanicImages
  } = props;

  const handleCardPlay = () => {
    if (selectedCardObject[yourID] === null) return;
    const { cost, id, set, uuid } = selectedCardObject[yourID];
    return playGlobalSpellCard(cost, id, set, uuid);
  };

  const mechImages = {
    boonSrc: gMI('BOON.png'),
    bubbleSrc: gMI('BUBBLE.png'),
    disabledSrc: gMI('DISABLED.png'),
    doubleAttackSrc: gMI('DOUBLE_ATTACK.png'),
    eventListenerSrc: gMI('EVENT.png'),
    onDeathSrc: gMI('ON_DEATH.png'),
    poisonSrc: gMI('POISON.png'),
    isHiddenSrc: gMI('HIDDEN.png')
  };

  const intImages = {
    canAttack: gII('CanAttack--Default.png'),
    canAttackBulwark: gII('CanAttack--Bulwark.png'),
    canBeAttacked: gII('CanBeAttacked--Default.png'),
    canBeAttackedBulwark: gII('CanBeAttacked--Default--Bulwark.png'),
    canBeAttackedLocation: gII('CanBeAttacked--Location.png'),
    canBeAttackedLocationBulwark: gII('CanBeAttacked--Location--Bulwark.png'),
    canBeBuffed: gII('CanBeBuffed--Default.png'),
    canBeBuffedBulwark: gII('CanBeBuffed--Bulwark.png'),
    canBeBuffedLocation: gII('CanBeBuffed--Location.png'),
    canBeBuffedLocationBulwark: gII('CanBeBuffed--Location--Bulwark.png'),
    canBeDebuffed: gII('CanBeDebuffed--Default.png'),
    canBeDebuffedBulwark: gII('CanBeDebuffed--Default--Bulwark.png'),
    canBeDebuffedLocation: gII('CanBeDebuffed--Location.png'),
    canBeDebuffedLocationBulwark: gII('CanBeDebuffed--Location--Bulwark.png'),
    isAttacking: gII('IsAttacking--Default.png'),
    isAttackingBulwark: gII('IsAttacking--Bulwark.png'),
    willDieOverlayTheirs: gII('WillDie-TheirBoard.png'),
    willDieOverlayYours: gII('WillDie-YourBoard.png')
  };

  const uiTooltipImage = getUiImage('UI_Tooltip.png');

  return (
    <div className={styles['board']} data-component="Board">
      <TheirBoard
        G={G}
        ctx={ctx}
        moves={moves}
        theirBoard={theirBoard}
        theirID={theirID}
        yourID={yourID}
        playerBoard={PLAYER_BOARDS[2]}
        uiTooltipSrc={uiTooltipImage}
        interactionImages={{
          canBeAttackedBulwarkSrc: intImages.canBeAttackedBulwark,
          canBeAttackedLocBulwarkSrc: intImages.canBeAttackedLocationBulwark,
          canBeAttackedLocSrc: intImages.canBeAttackedLocation,
          canBeAttackedSrc: intImages.canBeAttacked,
          canBeDebuffedBulwarkSrc: intImages.canBeDebuffedBulwark,
          canBeDebuffedLocBulwarkSrc: intImages.canBeDebuffedLocationBulwark,
          canBeDebuffedLocSrc: intImages.canBeDebuffedLocation,
          canBeDebuffedSrc: intImages.canBeDebuffed,
          willDieTheirSrc: intImages.willDieOverlayTheirs,
          willDieYourSrc: intImages.willDieOverlayYours
        }}
        mechanicImages={{
          hasBoonSrc: mechImages.boonSrc,
          hasBubbleSrc: mechImages.bubbleSrc,
          hasDoubleAttackSrc: mechImages.doubleAttackSrc,
          hasEventListenerSrc: mechImages.eventListenerSrc,
          hasOnDeathSrc: mechImages.onDeathSrc,
          hasPoisonSrc: mechImages.poisonSrc,
          isDisabledSrc: mechImages.disabledSrc,
          isHiddenSrc: mechImages.isHiddenSrc
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
        uiTooltipSrc={uiTooltipImage}
        minionIsSelected={selectedMinionObject[yourID] ? true : false}
        interactionImages={{
          canAttackBulwarkSrc: intImages.canAttackBulwark,
          canAttackSrc: intImages.canAttack,
          canBeBuffedBulwarkSrc: intImages.canBeBuffedBulwark,
          canBeBuffedLocationBulwarkSrc: intImages.canBeBuffedLocationBulwark,
          canBeBuffedLocationSrc: intImages.canBeBuffedLocation,
          canBeBuffedSrc: intImages.canBeBuffed,
          isAttackingBulwarkSrc: intImages.isAttackingBulwark,
          isAttackingSrc: intImages.isAttacking,
          willDieTheirSrc: intImages.willDieOverlayTheirs,
          willDieYourSrc: intImages.willDieOverlayYours
        }}
        mechanicImages={{
          hasBoonSrc: mechImages.boonSrc,
          hasBubbleSrc: mechImages.bubbleSrc,
          hasDoubleAttackSrc: mechImages.doubleAttackSrc,
          hasEventListenerSrc: mechImages.eventListenerSrc,
          hasOnDeathSrc: mechImages.onDeathSrc,
          hasPoisonSrc: mechImages.poisonSrc,
          isDisabledSrc: mechImages.disabledSrc,
          isHiddenSrc: mechImages.isHiddenSrc
        }}
      />

      <CardPlayArea
        active={selectedCardPlayType[yourID] === PLAY_TYPE['GLOBAL']}
        onMouseUp={() => handleCardPlay()}
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
