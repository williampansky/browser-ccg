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

const Minion = ({
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
  getMinionRaceClass,
  hasBubble,
  hasDoubleAttack,
  hasEventListener,
  hasOnDeath,
  hasPoison,
  health,
  howToEarn,
  howToEarnGolden,
  id,
  imageFlairSrc,
  imagePlaceholderSrc,
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
  totalHealth,
  type
}) => {
  return (
    <div
      className={[
        styles['minion'],
        styles[getMinionRaceClass(race)],
        hasBubble ? styles['minion--has-bubble'] : '',
        isAttacking ? styles['minion--is-attacking'] : '',
        currentHealth < totalHealth ? styles['minion--is-damaged'] : '',
        currentHealth === 0 ? styles['minion--is-dead'] : ''
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
        />
      </Suspense>

      <MinionAttack
        currentAttack={currentAttack}
        elite={elite}
        imageSrc={getCardAssetImage('attack', null, elite, ASSETS)}
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
        hasDoubleAttack={hasDoubleAttack}
        hasEventListener={hasEventListener}
        hasOnDeath={hasOnDeath}
        hasPoison={hasPoison}
        mechanicImages={MECHANICS}
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
  getMinionRaceClass: PropTypes.func,
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
  totalHealth: PropTypes.number,
  type: PropTypes.string
};

Minion.defaultProps = {
  getMinionRaceClass: () => {},
  imageFlairSrc: '',
  imagePlaceholderSrc: PLACEHOLDER_IMAGE,
  race: RACE['NONE']
};

export default Minion;
