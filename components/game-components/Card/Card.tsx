import { ReactElement, useEffect, useState } from 'react';
import { Card as CardProps } from '../../../types';
import { createMarkup, fontSizeBasedOnCharacterLength } from '../../../utils';

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

export interface ReactCardProps extends CardProps {
  isSelected?: boolean;
}

export const Card = ({
  isSelected = false,
  ...card
}: ReactCardProps): ReactElement => {
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
    text,
    type,
    uuid,
    zonePowerAdjustment,
  } = card;

  // const [textWidth, setTextWidth] = useState<number>(0);

  // useEffect(() => {
  //   const cardElem = document?.getElementById(uuid);
  //   const textElem = cardElem?.querySelector('[data-component="CardText"] svg');

  //   if (cardElem) {
  //     // @ts-ignore
  //     const width = textElem.width.baseVal.value;
  //     setTextWidth(width);
  //   }
  // }, [card]);

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
      <CardCost baseCost={baseCost} currentCost={currentCost} />

      <CardPower
        basePower={basePower}
        currentPower={displayPower}
        elite={elite}
        badgeImgSrc={'/images/card-assets/BADGE_SWORD.png'}
      />

      {/* <CardRarityGem rarity={rarity} /> */}
      <CardName name={name} formatter={fontSizeBasedOnCharacterLength} />
      <CardText markup={text} />
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

      <CardFlairImage name={name} set={set} id={id} />
      <CardBaseImage rarity={rarity} type={type} />
    </div>
  );
};
