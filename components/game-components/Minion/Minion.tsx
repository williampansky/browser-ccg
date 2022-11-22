import type { Card as CardProps } from '../../../types';
import { MinionHealth } from './MinionHealth/MinionHealth';
import { MinionImage } from './MinionImage/MinionImage';
import { MinionPower } from './MinionPower/MinionPower';
import styles from './minion.module.scss';
import { CardType } from '../../../enums';

export interface ReactMinionProps extends CardProps {
  isSelected?: boolean;
}

export const Minion = ({ isSelected = false, ...card }: ReactMinionProps) => {
  const {
    artist,
    baseCost,
    baseHealth,
    basePower,
    canPlay,
    collectible,
    currentCost,
    description,
    displayHealth,
    displayPower,
    elite,
    entourage,
    flavorText,
    fpoArt,
    howToEarn,
    howToEarnGolden,
    id,
    imageBaseSrc,
    imageFlairSrc,
    imagePlaceholderSrc,
    isGolden,
    key,
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
      className={[
        styles['minion'],
        mechanics?.find((m) => m === 'HIDDEN') ? 'minion--is-hidden' : '',
      ].join(' ')}
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

      {type === CardType.Minion && (
        <MinionHealth
          alternate={true}
          base={baseHealth}
          current={displayHealth}
          elite={elite}
        />
      )}

      {type === CardType.Minion && (
        <MinionPower
          alternate={true}
          base={basePower}
          current={displayPower}
          elite={elite}
        />
      )}

      <MinionImage
        id={id}
        name={name}
        set={set}
        rarity={rarity}
        src={imageFlairSrc}
        fpoArt={fpoArt}
        isHidden={mechanics?.find((m) => m === 'HIDDEN') ? true : false}
      />
    </div>
  );
};
