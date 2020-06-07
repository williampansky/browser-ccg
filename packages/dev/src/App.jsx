import React from 'react';
import { Card as Component } from '@ccg/components';
import { CARDS_CORE, CARDS_PRIME } from '@ccg/data';
import { CARDS, SETS } from '@ccg/images';
import { getCardBaseImage, getCardFlairImage } from '@ccg/utils';

const App = () => {
  const CARD = CARDS_PRIME['PRIME_125'];

  return (
    <React.Fragment>
      <div id="app">
        <Component
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
    </React.Fragment>
  );
};

export default App;
