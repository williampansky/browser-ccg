import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// import styles from './styles.module.scss';
import useHover from 'react-use-hover';
import ReactTooltip from 'react-tooltip';
import { PLAYER_BOARDS, PLAY_TYPE } from '@ccg/enums';
import { MECHANICS, SETS } from '@ccg/images';
import { usePrevious } from '@ccg/hooks';
import {
  getMechanicShortDescription,
  replaceConstant,
  getMinionFlairImage,
  getMechanicImage
} from '@ccg/utils';

// child components
// import IsDeadPoof from '@/components/game/animations/minions/IsDeadPoof';
import {
  Card,
  HasBoon,
  HasBubble,
  HasBulwarkBackground,
  HasBulwarkForeground,
  HasCurse,
  HasDoubleAttack,
  IsConcealed,
  IsDisabled,
  IsElite,
  Minion,
  MinionInteraction,
  WillExpire
} from '@ccg/components';
// import HasPoison from '../mechanics/HasPoison';

export default function BoardSlot({
  G,
  ctx,
  moves,
  isActive,
  canDrop,
  data,
  board,
  index,
  onClick,
  render,
  yourID,
  theirID,
  isEntering,
  dev
}) {
  const [wasAttackedState, setWasAttackedState] = useState(false);
  const { selectedCardObject } = G;
  const yourCelectedCardObject =
    selectedCardObject && selectedCardObject[yourID];
  const yourCardSpellType =
    selectedCardObject[yourID] && selectedCardObject[yourID].playType;
  const { killMinion } = moves;
  const {
    canAttack,
    canBeAttackedByMinion,
    canBeAttackedByPlayer,
    canBeAttackedBySpell,
    canBeAttackedByWarcry,
    canBeBuffed,
    canBeDebuffed,
    canBeExpired,
    canBeHealed,
    canBeReturned,
    canBeSacrificed,
    canBeStolen,
    canReceiveEnergyShield,
    canReceiveGuard,
    canReceiveOnslaught,
    currentAttack,
    currentHealth,
    hasBoon,
    hasCurse,
    hasEnergyShield,
    hasEventListener,
    hasGuard,
    hasOnslaught,
    hasPoison,
    isAttacking,
    isAttackingMinionIndex,
    isAttackingPlayer,
    isConcealed,
    isCursed,
    isDisabled,
    isDead,
    isImmune,
    minionData,
    minionData: {
      active,
      artist,
      attack,
      cardClass,
      collectible,
      cost,
      elite,
      entourage,
      flavor,
      goldenImageSrc,
      health,
      hideStats,
      howToEarn,
      howToEarnGolden,
      id,
      isGolden,
      mechanics,
      name,
      playRequirements,
      race,
      rarity,
      set,
      sounds,
      playContext,
      spellDamage,
      playType,
      targetingArrowText,
      text,
      type,
      numberPrimary
    },
    totalAttack,
    totalHealth,
    wasAttacked,
    willExpire,
    willExpireIn
  } = data;

  const playerID = board === PLAYER_BOARDS[1] ? yourID : theirID;
  const previousCurrentHealth = usePrevious(currentHealth);

  const hoveringTimer =
    canBeAttackedByMinion ||
    canBeAttackedByPlayer ||
    canBeAttackedBySpell ||
    canBeAttackedByWarcry
      ? 3000
      : 1400;

  const [isHovering, hoverProps] = useHover({
    mouseEnterDelayMS: hoveringTimer,
    mouseLeaveDelayMS: 0
  });

  const animateWasAttacked = useCallback(
    currentHealth => {
      if (isActive && board === PLAYER_BOARDS[2]) {
        currentHealth < previousCurrentHealth && setWasAttackedState(true);
        return setTimeout(() => {
          setWasAttackedState(false);
        }, 510);
      } else if (!isActive && board === PLAYER_BOARDS[1]) {
        currentHealth < previousCurrentHealth && setWasAttackedState(true);
        return setTimeout(() => {
          setWasAttackedState(false);
        }, 510);
      }
    },
    [board, isActive, previousCurrentHealth]
  );

  useEffect(() => {
    animateWasAttacked(currentHealth);
  }, [currentHealth, animateWasAttacked]);

  const KillMinionCallback = useCallback(
    index => {
      return setTimeout(() => {
        if (dev) return;
        killMinion(playerID, data, index);
      }, 900);
    },
    [playerID, data, dev, killMinion]
  );

  useEffect(() => {
    isDead && KillMinionCallback(index);
  }, [index, isDead, KillMinionCallback]);

  function handleIsAttackingClass(bool) {
    if (bool) return 'minion__animation--animate-attack';
  }

  function handleIsEnteringClass(bool) {
    if (bool) return 'minion__animation--is-entering';
    return setTimeout(() => {
      return '';
    }, 400);
  }

  function determineIfCardHover() {
    let bool = false;
    if (isHovering) bool = true;
    if (isAttacking) bool = false;
    if (isHovering && canBeAttackedByMinion) bool = true;
    if (isHovering && canBeAttackedByPlayer) bool = true;
    if (isHovering && canBeAttackedBySpell) bool = true;
    if (isHovering && canBeAttackedByWarcry) bool = true;
    if (canBeBuffed) bool = false;
    if (canBeDebuffed) bool = false;
    if (canBeExpired) bool = false;
    if (canBeHealed) bool = false;
    if (canBeReturned) bool = false;
    if (canBeSacrificed) bool = false;
    if (canBeStolen) bool = false;
    if (canReceiveEnergyShield) bool = false;
    if (canReceiveGuard) bool = false;
    if (canReceiveOnslaught) bool = false;
    return bool;
  }

  return (
    <div
      data-file="board-slots/BoardSlot"
      data-slot={index}
      data-render={render}
      data-for={`${id}--${index}`}
      data-tip={true}
      className={[
        'board__slot',
        data === null ? 'board__slot--is-empty' : '',
        data !== null ? 'board__slot--has-minion' : '',
        data === null && !canDrop ? 'board__slot--cannot-drop-minion' : '',
        isEntering ? handleIsEnteringClass(isEntering) : '',
        isDead ? 'minion--is-dead' : '',
        hasGuard ? 'minion--has-guard' : '',
        yourCelectedCardObject !== null &&
        yourCardSpellType !== PLAY_TYPE['TARGETED']
          ? 'board__slot--cannot-drop-minion'
          : '',
        wasAttackedState ? 'minion--was-attacked' : '',
        isAttacking ? 'minion--is-attacking' : '',
        isAttackingPlayer === true ? `board__slot--target__other_player` : '',
        isAttackingMinionIndex !== null
          ? `board__slot--target__slot-${isAttackingMinionIndex}`
          : ''
      ].join(' ')}
      onClick={onClick}
      onKeyPress={onClick}
      role="button"
      tabIndex={0}
      {...hoverProps}
    >
      {/* elite */}
      {minionData && elite && (
        <IsElite imgSrc={getMechanicImage('ELITE.png', MECHANICS)} />
      )}

      {/* interactions layer */}
      {minionData && (
        <MinionInteraction
          G={G}
          ctx={ctx}
          moves={moves}
          isActive={isActive}
          board={board}
          yourID={yourID}
          theirID={theirID}
          index={index}
          render={render}
          data={data}
          canAttack={canAttack}
          canBeAttackedByMinion={canBeAttackedByMinion}
          canBeAttackedByPlayer={canBeAttackedByPlayer}
          canBeAttackedBySpell={canBeAttackedBySpell}
          canBeAttackedByWarcry={canBeAttackedByWarcry}
          canBeBuffed={canBeBuffed}
          canBeHealed={canBeHealed}
          canBeDebuffed={canBeDebuffed}
          canBeExpired={canBeExpired}
          canBeReturned={canBeReturned}
          canBeSacrificed={canBeSacrificed}
          canBeStolen={canBeStolen}
          canReceiveEnergyShield={canReceiveEnergyShield}
          canReceiveGuard={canReceiveGuard}
          canReceiveOnslaught={canReceiveOnslaught}
          hasBoon={hasBoon}
          hasEnergyShield={hasEnergyShield}
          hasEventListener={hasEventListener}
          hasGuard={hasGuard}
          hasOnslaught={hasOnslaught}
          isAttacking={isAttacking}
          isConcealed={isConcealed}
          isCursed={isCursed}
          isDisabled={isDisabled}
          isImmune={isImmune}
          totalAttack={totalAttack}
          totalHealth={totalHealth}
          wasAttacked={wasAttacked}
          willExpire={willExpire}
          dev={dev}
        />
      )}

      {/* mechanics */}
      {minionData && hasBoon && <HasBoon />}
      {minionData && hasEnergyShield && <HasBubble />}
      {minionData && isImmune && <HasBubble />}
      {minionData && isConcealed && <IsConcealed />}
      {minionData && isDisabled && <IsDisabled />}
      {minionData && willExpire && <WillExpire count={willExpireIn} />}
      {minionData && hasGuard && (
        <HasBulwarkForeground
          imgSrc={getMechanicImage('BULWARK_FOREGROUND.png', MECHANICS)}
        />
      )}

      {/* visible minion component */}
      {minionData && (
        <Minion
          active={active}
          artist={artist}
          attack={attack}
          cardClass={cardClass}
          collectible={collectible}
          cost={cost}
          currentAttack={currentAttack}
          currentHealth={currentHealth}
          elite={elite}
          entourage={entourage}
          flavor={flavor}
          goldenImageSrc={goldenImageSrc}
          hasCurse={hasCurse}
          hasEnergyShield={hasEnergyShield}
          hasEventListener={hasEventListener}
          hasOnslaught={hasOnslaught}
          hasPoison={hasPoison}
          health={health}
          hideStats={hideStats}
          howToEarn={howToEarn}
          howToEarnGolden={howToEarnGolden}
          id={id}
          imageFlairSrc={getMinionFlairImage(id, set, SETS)}
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
          slot={index}
          sounds={sounds}
          spellDamage={spellDamage}
          targetingArrowText={targetingArrowText}
          text={text}
          totalHealth={totalHealth}
          type={type}
          wasAttacked={wasAttacked}
        />
      )}

      {/* visible minion component */}
      {/* {minionData ? (
        <div
          className={[
            styles['board__slot__card__tooltip'],
            determineIfCardHover()
              ? 'uk-animation-scale-up uk-transform-origin-bottom-left'
              : ''
          ].join(' ')}
        >
          <Card
            artist={artist}
            attack={attack}
            cardClass={cardClass}
            collectible={collectible}
            cost={cost}
            elite={elite}
            entourage={entourage}
            flavor={flavor}
            goldenImageSrc={goldenImageSrc}
            health={health}
            hideStats={hideStats}
            howToEarn={howToEarn}
            howToEarnGolden={howToEarnGolden}
            id={id}
            isGolden={isGolden}
            mechanics={mechanics}
            name={name}
            playRequirements={playRequirements}
            race={race}
            rarity={rarity}
            set={set}
            sounds={sounds}
            spellDamage={spellDamage}
            playType={playType}
            targetingArrowText={targetingArrowText}
            text={text}
            type={type}
            numberPrimary={numberPrimary}
          />
          {mechanics && mechanics.length ? (
            <div className="tooltip__mechanics__wrapper">
              {mechanics.map((m, i) => {
                return (
                  <div className="mechanic__item" key={m}>
                    <div className="mechanic__item-title">
                      {replaceConstant(m)}
                    </div>
                    <div className="mechanic__item-description">
                      {getMechanicShortDescription(m)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null} */}

      {minionData && hasGuard && (
        <HasBulwarkBackground
          imgSrc={getMechanicImage('BULWARK_BACKGROUND.png', MECHANICS)}
          race={race}
        />
      )}
      {/* {isDead && <IsDeadPoof />} */}
    </div>
  );
}

BoardSlot.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  index: PropTypes.number,
  render: PropTypes.bool,
  board: PropTypes.string,
  canDrop: PropTypes.bool,
  onClick: PropTypes.func,
  theirID: PropTypes.string,
  yourID: PropTypes.string,
  data: PropTypes.object
};

BoardSlot.defaultProps = {
  G: {
    selectedCardObject: {
      playType: PLAY_TYPE['TARGETED']
    }
  },
  moves: {
    killMinion: () => {}
  },
  isActive: false,
  index: 0,
  render: false,
  board: PLAYER_BOARDS[1],
  canDrop: false,
  onClick: () => {},
  theirID: '0',
  yourID: '0',
  data: {
    canAttack: false,
    canBeAttackedByMinion: false,
    canBeAttackedByPlayer: false,
    canBeAttackedBySpell: false,
    canBeAttackedByWarcry: false,
    canBeBuffed: false,
    canBeDebuffed: false,
    canBeExpired: false,
    canBeHealed: false,
    canBeReturned: false,
    canBeSacrificed: false,
    canBeStolen: false,
    canReceiveEnergyShield: false,
    canReceiveGuard: false,
    canReceiveOnslaught: false,
    currentAttack: 0,
    currentHealth: 1,
    hasBoon: false,
    hasCurse: false,
    hasEnergyShield: false,
    hasGuard: false,
    hasOnslaught: false,
    isAttacking: false,
    isAttackingMinionIndex: false,
    isAttackingPlayer: false,
    isConcealed: false,
    isCursed: false,
    isDisabled: false,
    isDead: false,
    totalAttack: 0,
    totalHealth: 1,
    willExpire: false,
    willExpireIn: false
  }
};
