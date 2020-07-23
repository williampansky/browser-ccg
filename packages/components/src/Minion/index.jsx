import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { RACE } from '@ccg/enums';
import {
  getCardAssetImage,
  replaceConstant,
  getMinionFlairImage
} from '@ccg/utils';
import {
  CARD_ASSETS as ASSETS,
  MECHANICS,
  PLACEHOLDER_IMAGE
} from '@ccg/images';

// child components
import MinionAttack from './elements/MinionAttack';
import MinionHealth from './elements/MinionHealth';
import MinionImage from './elements/MinionImage';
import MechanicIcon from './elements/MechanicIcon';
import { useEffect } from 'react';
import { useState } from 'react';

const Minion = props => {
  const {
    active,
    artist,
    attack,
    collectible,
    cost,
    currentAttack,
    currentHealth,
    elite,
    entourage,
    flavor,
    hasBoon,
    hasBoonSrc,
    hasBubble,
    hasDoubleAttack,
    hasDoubleAttackSrc,
    hasEventListener,
    hasEventListenerSrc,
    hasOnDeath,
    hasOnDeathSrc,
    hasPoison,
    hasPoisonSrc,
    health,
    howToEarn,
    howToEarnGolden,
    id,
    imageFlairSrc,
    imagePlaceholderSrc,
    isAttacking,
    isDead,
    isGolden,
    mechanics,
    minionRaceClass,
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
    totalAttack,
    totalHealth,
    type,
    willExpire,
    willExpireIn,
    isHidden,
    isHiddenSrc
  } = props;

  return (
    <div
      className={[
        styles['minion'],
        styles[minionRaceClass],
        hasBubble ? styles['minion--has-bubble'] : '',
        isAttacking ? styles['minion--is-attacking'] : '',
        currentHealth < totalHealth ? styles['minion--is-damaged'] : '',
        isDead ? styles['minion--is-dead'] : ''
      ].join(' ')}
      data-component="Minion"
    >
      <Suspense fallback={<div className={styles['loader']} />}>
        <MinionImage
          id={id}
          isGolden={isGolden}
          imgSrc={imageFlairSrc}
          name={name}
          placeholderSrc={imagePlaceholderSrc}
          set={set}
          willExpire={willExpire}
          isHidden={isHidden}
          isHiddenSrc={isHiddenSrc}
        />
      </Suspense>

      <MinionAttack
        currentAttack={currentAttack}
        elite={elite}
        imageSrc={getCardAssetImage('attack', null, elite, ASSETS)}
        isBuffed={currentAttack > totalAttack}
        isDebuffed={currentAttack < totalAttack}
        totalAttack={totalAttack}
      />

      <MinionHealth
        currentHealth={currentHealth}
        elite={elite}
        imageSrc={getCardAssetImage('health', null, elite, ASSETS)}
        isBuffed={currentHealth > totalHealth}
        isDamaged={currentHealth < totalHealth}
        totalHealth={totalHealth}
      />

      <MechanicIcon
        hasBoon={hasBoon}
        hasBoonSrc={hasBoonSrc}
        hasDoubleAttack={hasDoubleAttack}
        hasDoubleAttackSrc={hasDoubleAttackSrc}
        hasEventListener={hasEventListener}
        hasEventListenerSrc={hasEventListenerSrc}
        hasOnDeath={hasOnDeath}
        hasOnDeathSrc={hasOnDeathSrc}
        hasPoison={hasPoison}
        hasPoisonSrc={hasPoisonSrc}
        willExpire={willExpire}
        willExpireIn={willExpireIn}
      />
    </div>
  );
};

Minion.propTypes = {
  active: PropTypes.bool,
  artist: PropTypes.string,
  attack: PropTypes.number,
  collectible: PropTypes.bool,
  cost: PropTypes.number,
  currentAttack: PropTypes.number,
  currentHealth: PropTypes.number,
  elite: PropTypes.bool,
  entourage: PropTypes.array,
  flavor: PropTypes.string,
  hasBoon: PropTypes.bool,
  hasBubble: PropTypes.bool,
  hasDoubleAttack: PropTypes.bool,
  hasEventListener: PropTypes.bool,
  hasOnDeath: PropTypes.bool,
  hasPoison: PropTypes.bool,
  health: PropTypes.number,
  howToEarn: PropTypes.string,
  howToEarnGolden: PropTypes.string,
  id: PropTypes.string,
  imageFlairSrc: PropTypes.string,
  imagePlaceholderSrc: PropTypes.string,
  isAttacking: PropTypes.bool,
  isGolden: PropTypes.bool,
  mechanics: PropTypes.array,
  minionRaceClass: PropTypes.string,
  name: PropTypes.string,
  numberPrimary: PropTypes.number,
  playContext: PropTypes.string,
  playRequirements: PropTypes.string,
  playType: PropTypes.string,
  race: PropTypes.string,
  rarity: PropTypes.string,
  set: PropTypes.string,
  slot: PropTypes.number,
  sounds: PropTypes.object,
  targetingArrowText: PropTypes.string,
  text: PropTypes.string,
  totalAttack: PropTypes.number,
  totalHealth: PropTypes.number,
  type: PropTypes.string
};

Minion.defaultProps = {
  imageFlairSrc: '',
  imagePlaceholderSrc: PLACEHOLDER_IMAGE,
  race: RACE['NONE'],
  willExpire: false,
  willExpireIn: 2
};

export default Minion;
