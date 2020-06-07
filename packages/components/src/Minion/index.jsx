import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { RARITY } from '@ccg/enums';
import { getCardAssetImage, replaceConstant } from '@ccg/utils';
import {
  CARD_ASSETS as ASSETS,
  MECHANICS,
  PLACEHOLDER_IMAGE
} from '@ccg/images';

// child components
import Attack from './elements/attack';
import Health from './elements/health';
import Image from './elements/image';
import MechanicIcon from './elements/mechanic-icon';

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
  hasCurse,
  hasEnergyShield,
  hasEventListener,
  hasOnslaught,
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
  type,
  wasAttacked
}) => {
  /**
   * Returns minion race in lower case format
   * @param {string} race
   */
  function getMinionRaceClass(race) {
    return `minion__race--${replaceConstant(race).toLowerCase()}`;
  }

  return (
    <div
      className={[
        styles['minion'],
        styles[getMinionRaceClass(race)],
        hasEnergyShield ? styles['minion--has-energy-shield'] : '',
        isAttacking ? styles['minion--is-attacking'] : '',
        wasAttacked ? styles['minion--was-attacked'] : '',
        currentHealth < totalHealth ? styles['minion--is-damaged'] : '',
        currentHealth === 0 ? styles['minion--is-dead'] : ''
      ].join(' ')}
      data-file="Minion"
    >
      <Image
        id={id}
        isGolden={isGolden}
        imgSrc={imageFlairSrc}
        name={name}
        placeholderSrc={imagePlaceholderSrc}
        set={set}
      />
      <Attack
        currentAttack={currentAttack}
        elite={elite}
        imageSrc={getCardAssetImage('attack', null, elite, ASSETS)}
      />
      <Health
        currentHealth={currentHealth}
        elite={elite}
        imageSrc={getCardAssetImage('health', null, elite, ASSETS)}
        isDamaged={currentHealth < totalHealth}
      />
      <MechanicIcon
        hasCurse={hasCurse}
        hasEventListener={hasEventListener}
        hasOnslaught={hasOnslaught}
        hasPoison={hasPoison}
        mechanicImages={MECHANICS}
      />
    </div>
  );
};

Minion.propTypes = {
  active: PropTypes.string,
  artist: PropTypes.string,
  attack: PropTypes.string,
  collectible: PropTypes.string,
  cost: PropTypes.string,
  currentAttack: PropTypes.string,
  currentHealth: PropTypes.string,
  elite: PropTypes.string,
  entourage: PropTypes.string,
  flavor: PropTypes.string,
  hasCurse: PropTypes.string,
  hasEnergyShield: PropTypes.string,
  hasEventListener: PropTypes.string,
  hasOnslaught: PropTypes.string,
  hasPoison: PropTypes.string,
  health: PropTypes.string,
  howToEarn: PropTypes.string,
  howToEarnGolden: PropTypes.string,
  id: PropTypes.string,
  imageFlairSrc: PropTypes.string,
  imagePlaceholderSrc: PropTypes.string,
  isAttacking: PropTypes.string,
  isGolden: PropTypes.string,
  mechanics: PropTypes.string,
  name: PropTypes.string,
  numberPrimary: PropTypes.string,
  playContext: PropTypes.string,
  playRequirements: PropTypes.string,
  playType: PropTypes.string,
  race: PropTypes.string,
  rarity: PropTypes.string,
  set: PropTypes.string,
  slot: PropTypes.string,
  sounds: PropTypes.string,
  targetingArrowText: PropTypes.string,
  text: PropTypes.string,
  totalHealth: PropTypes.string,
  type: PropTypes.string,
  wasAttacked: PropTypes.string
};

Minion.defaultProps = {
  imageFlairSrc: '',
  imagePlaceholderSrc: PLACEHOLDER_IMAGE
};

export default Minion;
