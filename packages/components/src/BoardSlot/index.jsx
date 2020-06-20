import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { PLAYER_BOARDS } from '@ccg/enums';
import {
  getMechanicImage,
  getMinionFlairImage,
  replaceConstant
} from '@ccg/utils';
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
  YourMinionInteractions,
  TheirMinionInteractions
} from '@ccg/components';

const BoardSlot = props => {
  const {
    G,
    ctx,
    moves,
    board,
    handleCanAttackFunction,
    handleIsAttackingFunction,
    index,
    playerID,
    slotObject,
    slotObject: {
      canAttack,
      canBeAttackedByMinion,
      canBeAttackedByPlayer,
      canBeAttackedBySpell,
      canBeAttackedByOnPlay,
      canBeBuffed,
      canBeDebuffed,
      canBeDestroyed,
      canBeExpired,
      canBeHealed,
      canBeReturned,
      canBeStolen,
      canReceiveBubble,
      canReceiveBulwark,
      canReceiveDoubleAttack,
      canReceiveRush,
      currentAttack,
      currentHealth,
      hasAttacked,
      hasBoon,
      hasBubble,
      hasBulwark,
      hasCantTarget,
      hasDoubleAttack,
      hasDoubleAttackCount,
      hasEventListener,
      hasLifesteal,
      hasNoAttack,
      hasOnDeath,
      hasPoison,
      hasRush,
      hasSpellDamage,
      isAttacking,
      isAttackingMinionIndex,
      isAttackingPlayer,
      isBooned,
      isBuffed,
      isDead,
      isDebuffed,
      isDisabled,
      isDisabledFor,
      isHidden,
      isImmune,
      isSilenced,
      minionData: {
        active,
        artist,
        attack,
        collectible,
        cost,
        elite,
        entourage,
        flavor,
        health,
        howToEarn,
        howToEarnGolden,
        id,
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
      totalAttack,
      totalHealth,
      willExpire,
      willExpireIn
    }
  } = props;

  /**
   * Returns minion race in lower case format
   * @param {string} race
   */
  function getMinionRaceClass(str) {
    return `minion__race--${replaceConstant(str).toLowerCase()}`;
  }

  return (
    <div
      className={[
        styles['board__slot'],
        isAttacking ? 'board__slot--is-attacking' : ''
      ].join(' ')}
      data-component="BoardSlot"
      data-has-bulwark={hasBulwark}
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
      {board === PLAYER_BOARDS[1] ? (
        <YourMinionInteractions
          G={G}
          ctx={ctx}
          moves={moves}
          canAttack={canAttack}
          isAttacking={isAttacking}
          handleCanAttackFunction={handleCanAttackFunction}
          handleIsAttackingFunction={handleIsAttackingFunction}
        />
      ) : (
        <TheirMinionInteractions
          G={G}
          ctx={ctx}
          moves={moves}
          handleCanBeAttackedByMinionFunction={e => console.log(e)}
          canBeAttackedByMinion={canBeAttackedByMinion}
        />
      )}

      {/* minion box shadows */}
      <div
        className={[
          'minion__shadows',
          slotObject && race ? getMinionRaceClass(race) : ''
        ].join(' ')}
        data-component="minion-shadows"
      />

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