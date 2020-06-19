import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getMechanicImage, getMinionFlairImage } from '@ccg/utils';
import {
  Minion,
  Boon,
  Bubble,
  BulwarkBackground,
  BulwarkForeground,
  Disabled,
  DoubleAttack,
  Elite,
  Poison,
  YourMinionInteractions
} from '@ccg/components';

const BoardSlot = props => {
  const {
    G,
    ctx,
    moves,
    index,
    playerID,
    slotObject,
    slotObject: {
      canAttack,
      currentAttack,
      currentHealth,
      hasBulwark,
      hasBoon,
      IsAttacking,
      minionData: {
        active,
        artist,
        attack,
        collectible,
        cost,
        elite,
        entourage,
        flavor,
        hasOnDeath,
        hasBubble,
        hasEventListener,
        hasDoubleAttack,
        hasPoison,
        health,
        howToEarn,
        howToEarnGolden,
        id,
        isAttacking,
        isGolden,
        mechanics,
        name,
        numberPrimary,
        playContext,
        playRequirements,
        playType,
        race,
        rarity,
        set,
        slot,
        sounds,
        targetingArrowText,
        text,
        type
      },
      totalHealth
    }
  } = props;

  return (
    <div
      className={styles['board__slot']}
      data-component="BoardSlot"
      data-is-empty={slotObject === null}
      data-slot={index}
    >
      {/* mechanics (above minion) */}
      {slotObject && hasBoon && <Boon />}
      {slotObject && hasBulwark && (
        <BulwarkForeground
          imgSrc={getMechanicImage('BULWARK_FOREGROUND.png')}
        />
      )}

      {/* minion interactions */}
      <YourMinionInteractions
        G={G}
        ctx={ctx}
        moves={moves}
        canAttack={canAttack}
        IsAttacking={IsAttacking}
      />

      {/* minion box shadows */}
      <div className="minion__shadows" data-component="minion-shadows" />

      {/* visible minion component */}
      <Minion
        active={active}
        artist={artist}
        attack={attack}
        collectible={collectible}
        cost={cost}
        currentAttack={currentAttack}
        currentHealth={currentHealth}
        elite={elite}
        entourage={entourage}
        flavor={flavor}
        hasBubble={hasBubble}
        hasDoubleAttack={hasDoubleAttack}
        hasEventListener={hasEventListener}
        hasOnDeath={hasOnDeath}
        hasPoison={hasPoison}
        health={health}
        howToEarn={howToEarn}
        howToEarnGolden={howToEarnGolden}
        id={id}
        imageFlairSrc={getMinionFlairImage(id, set, isGolden)}
        isAttacking={isAttacking}
        isGolden={isGolden}
        mechanics={mechanics}
        name={name}
        numberPrimary={numberPrimary}
        playContext={playContext}
        playRequirements={playRequirements}
        playType={playType}
        race={race}
        rarity={rarity}
        set={set}
        slot={slot}
        sounds={sounds}
        targetingArrowText={targetingArrowText}
        text={text}
        totalHealth={totalHealth}
        type={type}
      />

      {/* mechanics (behind minion) */}
      {slotObject && hasBulwark && (
        <BulwarkBackground
          imgSrc={getMechanicImage('BULWARK_BACKGROUND.png')}
          race={race}
        />
      )}
    </div>
  );
};

BoardSlot.propTypes = {
  playerID: PropTypes.string.isRequired,
  slotObject: PropTypes.object.isRequired
};

BoardSlot.defaultProps = {};

export default BoardSlot;
