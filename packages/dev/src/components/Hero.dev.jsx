/* eslint-disable no-unused-vars */
import React from 'react';
import { Hero } from '@ccg/components';
import { ABILITIES, CARDS_DATABASE } from '@ccg/data';
import { getHeroImage, getHeroName } from '@ccg/utils';
import {
  ABILITIES_ICON,
  ABILITIES_ICON_CLOSE,
  COST_GEM_IMAGE,
  PLACEHOLDER_IMAGE
} from '@ccg/images';

export default function HeroDev() {
  const HERO = 'ZEUS';
  const HERO_SYMBOL = `%HERO_${HERO}%`;
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
  const HERO_ABILITIES = [
    ABILITIES[`HERO_${HERO}_001`],
    ABILITIES[`HERO_${HERO}_002`],
    ABILITIES[`HERO_${HERO}_003`]
  ];

  return (
    <div id="app" style={{ justifyContent: 'flex-end' }}>
      <Hero
        abilitiesImageBase={ABILITIES_ICON}
        abilitiesImageClose={ABILITIES_ICON_CLOSE}
        avatarPlaceholderImageSrc={PLACEHOLDER_IMAGE}
        cardsInDeck={19}
        cardsInHand={4}
        costGemImageSrc={COST_GEM_IMAGE}
        heroAbilities={HERO_ABILITIES}
        heroSymbol={HERO_SYMBOL}
        playerDeck={PLAYER_DECK}
        playerId={0}
        playerName="pantsme"
      />
    </div>
  );
}
