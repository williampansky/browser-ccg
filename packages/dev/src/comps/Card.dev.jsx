/* eslint-disable no-unused-vars */
import React from 'react';
import { Card } from '@ccg/components';
import { CARDS, SETS } from '@ccg/images';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';
import {
  CARDS_CORE,
  CARDS_ENTOURAGE,
  CARDS_GAME,
  CARDS_PRIME
} from '@ccg/data';

export default function CardDev() {
  const CARD = CARDS_CORE['CORE_020'];

  return (
    <div id="app">
      <Card
        active={CARD.active}
        artist={CARD.artist}
        attack={CARD.attack}
        collectible={CARD.collectible}
        cost={CARD.cost}
        deckBuilder={CARD.deckBuilder}
        dev={true}
        elite={CARD.elite}
        entourage={CARD.entourage}
        flavor={CARD.flavor}
        health={CARD.health}
        howToEarn={CARD.howToEarn}
        howToEarnGolden={CARD.howToEarnGolden}
        id={CARD.id}
        imageBaseSrc={getCardBaseImage(CARD.rarity, CARD.type, CARDS)}
        imageFlairSrc={getCardFlairImage(CARD.id, CARD.set, SETS)}
        isGolden={CARD.isGolden}
        mechanics={CARD.mechanics}
        name={CARD.name}
        numberOvercharge={CARD.numberOvercharge}
        numberPrimary={CARD.numberPrimary}
        numberRNG={CARD.numberRNG}
        numberSecondary={CARD.numberSecondary}
        onClick={CARD.onClick}
        playContext={CARD.playContext}
        playRequirements={CARD.playRequirements}
        playType={CARD.playType}
        race={CARD.race}
        rarity={CARD.rarity}
        set={CARD.set}
        sounds={CARD.sounds}
        targetingArrowText={CARD.targetingArrowText}
        text={CARD.text}
        type={CARD.type}
      />
    </div>
  );
}
