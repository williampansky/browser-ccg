import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { getCardAssetImage, replaceConstant } from '@ccg/utils';
import { RACE } from '@ccg/enums';
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
  type
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
        currentHealth < totalHealth ? styles['minion--is-damaged'] : '',
        currentHealth === 0 ? styles['minion--is-dead'] : ''
      ].join(' ')}
      data-component="Minion"
    >
      <MinionImage
        id={id}
        isGolden={isGolden}
        imgSrc={imageFlairSrc}
        name={name}
        placeholderSrc={imagePlaceholderSrc}
        set={set}
      />
      <MinionAttack
        currentAttack={currentAttack}
        elite={elite}
        imageSrc={getCardAssetImage('attack', null, elite, ASSETS)}
      />
      <MinionHealth
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
  hasCurse: PropTypes.bool,
  hasEnergyShield: PropTypes.bool,
  hasEventListener: PropTypes.bool,
  hasOnslaught: PropTypes.bool,
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
  imageFlairSrc: '',
  imagePlaceholderSrc: PLACEHOLDER_IMAGE,
  race: RACE['NONE']
};

export default Minion;
