/* eslint-disable no-unused-vars */
import React from 'react';
import { Hero } from '@ccg/components';
import { PLACEHOLDER_IMAGE } from '@ccg/images';
import { getHeroImage, getHeroName } from '@ccg/utils';

export default function HeroDev() {
  const HERO_SYMBOL = '%HERO_ZEUS%';

  return (
    <div id="app">
      <Hero
        heroSymbol={HERO_SYMBOL}
        avatarPlaceholderImageSrc={PLACEHOLDER_IMAGE}
        cardsInDeck={19}
        cardsInHand={4}
        playerId={0}
        playerName="pantsme"
      />
    </div>
  );
}
