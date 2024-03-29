import { Card as CardProps } from '../../../types';
import {
  createMarkup,
  fontSizeBasedOnCharacterLength,
  formatCardText,
  replaceAllConstants,
} from '../../../utils';

import { CardBaseImage } from './CardBaseImage/CardBaseImage';
import { CardCost } from './CardCost/CardCost';
import { CardFlairImage } from './CardFlairImage/CardFlairImage';
import { CardName } from './CardName/CardName';
import { CardPower } from './CardPower/CardPower';
import { CardRarityGem } from './CardRarityGem/CardRarityGem';
import { CardSubTypeBadge } from './CardSubTypeBadge/CardSubTypeBadge';
import { CardText } from './CardText/CardText';
import { CardTypeBadge } from './CardTypeBadge/CardTypeBadge';
import { CardTypeLabel } from './CardTypeLabel/CardTypeLabel';

import styles from './card.module.scss';
import { CardHealth } from './CardHealth/CardHealth';
import { useCallback } from 'react';

export interface ReactCardProps extends CardProps {
  isSelected?: boolean;
}

export const Card = ({ isSelected = false, ...card }: ReactCardProps) => {
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
    healthStream,
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
    text,
    type,
    uuid,
    zonePowerAdjustment,
  } = card;

  const formattedCardText = useCallback(() => {
    return replaceAllConstants(
      formatCardText(text, numberPrimary, numberSecondary, numberRNG, 0)
    );
  }, [text, numberPrimary, numberSecondary, numberRNG, 0]);

  return (
    <div
      className={[
        styles['card'],
        elite ? styles['elite'] : '',
        !canPlay ? styles['cant-play'] : '',
      ].join(' ')}
      data-component='Card'
      id={uuid}
    >
      <CardCost
        base={baseCost}
        current={currentCost}
        isIncreased={booleans?.hasCostIncreased}
        isReduced={booleans?.hasCostReduced}
      />

      {type === 'MINION' && (
        <>
          <CardHealth
            base={baseHealth}
            current={displayHealth}
            elite={elite}
            isIncreased={booleans?.hasHealthIncreased}
            isReduced={booleans?.hasHealthReduced}
          />
          <CardPower
            basePower={basePower}
            currentPower={displayPower}
            elite={elite}
            isIncreased={booleans?.hasPowerIncreased}
            isReduced={booleans?.hasPowerReduced}
          />
        </>
      )}

      {/* <CardRarityGem rarity={rarity} /> */}
      <CardName name={name} formatter={fontSizeBasedOnCharacterLength} />
      <CardText markup={createMarkup(formattedCardText())} />
      <CardTypeLabel race={race} type={type} formatter={(val: any) => val} />

      {/* <CardTypeBadge
        race={race}
        type={type}
        badgeImgSrc={'/images/card-assets/TYPE_WRAPPER.png'}
      />

      <CardSubTypeBadge
        race={race}
        type={type}
        badgeImgSrc={'/images/card-assets/SUBTYPE_WRAPPER.png'}
      /> */}

      <CardFlairImage name={name} src={imageFlairSrc} fpoArt={fpoArt} />
      <CardBaseImage rarity={rarity} type={type} />
    </div>
  );
};
