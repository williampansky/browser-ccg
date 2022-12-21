import type { Card as CardProps } from '../../../types';
import { MinionHealth } from './MinionHealth/MinionHealth';
import { MinionImage } from './MinionImage/MinionImage';
import { MinionPower } from './MinionPower/MinionPower';
import { CardType } from '../../../enums';
import styles from './minion.module.scss';

export interface ReactMinionProps extends CardProps {
  isSelected?: boolean;
}

export const Minion = ({ isSelected = false, ...card }: ReactMinionProps) => {
  const {
    artist,
    baseCost,
    baseHealth,
    basePower,
    booleans,
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
    targetingText,
    type,
    uuid,
    zonePowerAdjustment,
  } = card;

  return (
    <div
      className={[
        styles['minion'],
        booleans?.isHidden ? 'minion--is-hidden' : '',
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
        <>
          <MinionHealth
            alternate={true}
            base={baseHealth}
            current={displayHealth}
            elite={elite}
            isIncreased={booleans?.hasHealthIncreased}
            isReduced={booleans?.hasHealthReduced}
            isDestroyed={booleans?.isDestroyed}
          />
          <MinionPower
            alternate={true}
            base={basePower}
            current={displayPower}
            elite={elite}
            isIncreased={booleans?.hasPowerIncreased}
            isReduced={booleans?.hasPowerReduced}
            isDestroyed={booleans?.isDestroyed}
          />
        </>
      )}

      <MinionImage
        id={id}
        name={name}
        set={set}
        rarity={rarity}
        src={imageFlairSrc}
        fpoArt={fpoArt}
        isDestroyed={booleans?.isDestroyed}
        isHidden={mechanics?.find((m) => m === 'HIDDEN') ? true : false}
      />
    </div>
  );
};
