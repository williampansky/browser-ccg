import { ReactElement } from 'react';
import { Card as CardProps } from '../../../types';
import { createMarkup, fontSizeBasedOnCharacterLength } from '../../../utils';
import styles from './minion.module.scss';
import { MinionCost } from './MinionCost/MinionCost';
import { MinionImage } from './MinionImage/MinionImage';
import { MinionPower } from './MinionPower/MinionPower';

export interface ReactMinionProps extends CardProps {
  isSelected?: boolean;
}

export const Minion = ({
  isSelected = false,
  ...card
}: ReactMinionProps): ReactElement => {
  const {
    artist,
    baseCost,
    basePower,
    canPlay,
    collectible,
    currentCost,
    description,
    displayPower,
    elite,
    entourage,
    flavorText,
    howToEarn,
    howToEarnGolden,
    id,
    imageBaseSrc,
    imageFlairSrc,
    imagePlaceholderSrc,
    isGolden,
    mechanics,
    name,
    numberPrimary,
    numberRNG,
    numberSecondary,
    powerOverride,
    powerStream,
    race,
    rarity,
    revealed,
    revealedOnTurn,
    set,
    sounds,
    type,
    uuid,
    zonePowerAdjustment,
  } = card;

  return (
    <div
      className={[styles['minion']].join(' ')}
      data-component='Minion'
      id={uuid}
    >
      {/* <MinionCost
        cost={currentCost}
        elite={elite}
        imageSrc={'../../../images/card-assets/BADGE_GEM.png'}
      /> */}

      {/* <MinionPower
        elite={elite}
        power={displayPower}
        imageSrc={'../../../images/card-assets/BADGE_SWORD.png'}
      /> */}

      <MinionPower
        alternate={true}
        elite={elite}
        basePower={basePower}
        currentPower={displayPower}
        imageSrc={'../../../images/card-assets/TYPE_WRAPPER.png'}
      />
      
      <MinionImage
        id={id}
        name={name}
        set={set}
        rarity={rarity}
      />
    </div>
  );
};
