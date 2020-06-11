/* eslint-disable no-unused-vars */
import React from 'react';
import { Hero } from '@ccg/components';
import { COST_GEM_IMAGE, PLACEHOLDER_IMAGE } from '@ccg/images';
import { getHeroImage, getHeroName } from '@ccg/utils';
import { CARDS_DATABASE } from '@ccg/data';

export default function HeroDev() {
  const HERO_SYMBOL = '%HERO_ZEUS%';
  const PLAYER_DECK = [
    {
      ...CARDS_DATABASE['CORE_001'.replace(' ', '')],
      _id: 'CORE_001',
      _amount: 0
    },
    {
      ...CARDS_DATABASE['CORE_002'.replace(' ', '')],
      _id: 'CORE_002',
      _amount: 2
    },
    {
      ...CARDS_DATABASE['CORE_020'.replace(' ', '')],
      _id: 'CORE_020',
      _amount: 2
    },
    {
      ...CARDS_DATABASE['CORE_030'.replace(' ', '')],
      _id: 'CORE_030',
      _amount: 2
    },
    {
      ...CARDS_DATABASE['CORE_022'.replace(' ', '')],
      _id: 'CORE_022',
      _amount: 1
    },
    {
      ...CARDS_DATABASE['CORE_040'.replace(' ', '')],
      _id: 'CORE_040',
      _amount: 2
    },
    {
      ...CARDS_DATABASE['CORE_080'.replace(' ', '')],
      _id: 'CORE_080',
      _amount: 2
    },
    {
      ...CARDS_DATABASE['CORE_044'.replace(' ', '')],
      _id: 'CORE_044',
      _amount: 2
    }
  ].sort((a, b) => a.cost - b.cost);

  return (
    <div id="app">
      <Hero
        avatarPlaceholderImageSrc={PLACEHOLDER_IMAGE}
        cardsInDeck={19}
        cardsInHand={4}
        costGemImageSrc={COST_GEM_IMAGE}
        heroSymbol={HERO_SYMBOL}
        playerDeck={PLAYER_DECK}
        playerId={0}
        playerName="pantsme"
      />
    </div>
  );
}
