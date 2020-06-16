import React from 'react';
import PropTypes from 'prop-types';

import { Opponent } from '@ccg/components';

const OpponentWrapper = props => {
  const {
    G: {
      deckInfo,
      playerHero,
      players,
      actionPoints,
      playerHealth,
      playerName,
      playerHeroAbilities,
      selectedCardObject,
      selectedCardInteractionContext,
      counts
    },
    playerID,
    images: {
      CARDS: IMAGES_CARDS,
      SETS: IMAGES_SETS,
      ABILITIES_ICON,
      ABILITIES_ICON_CLOSE,
      PLACEHOLDER_IMAGE,
      COST_GEM_IMAGE
    }
  } = props;

  const { current: currentAP, total: totalAP } = actionPoints[playerID];
  const { hand } = players[playerID];
  const { deckLength, handLength } = counts[playerID];

  return (
    <Opponent
      abilitiesImageBase={ABILITIES_ICON}
      abilitiesImageClose={ABILITIES_ICON_CLOSE}
      avatarPlaceholderImageSrc={PLACEHOLDER_IMAGE}
      cardsInDeckCount={deckLength}
      cardsInHandArray={hand}
      cardsInHandCount={handLength}
      costGemImageSrc={COST_GEM_IMAGE}
      // deselectCardFunction={() => setSelectedCardObject(null)}
      actionPointsCurrent={currentAP}
      actionPointsTotal={totalAP}
      heroAbilities={playerHeroAbilities[playerID]}
      heroSymbol={playerHero[playerID]}
      imagesDataCards={IMAGES_CARDS}
      imagesDataSets={IMAGES_SETS}
      playerDeck={deckInfo[playerID]}
      playerHealthCurrent={playerHealth[playerID]}
      playerHealthTotal={30}
      playerName={playerName[playerID]}
      // selectCardFunction={obj => setSelectedCardObject(obj)}
      selectedCardObject={selectedCardObject[playerID]}
      selectedCardUuid={
        selectedCardObject[playerID] && selectedCardObject[playerID].uuid
      }
      theirID={playerID}
      selectedCardContext={selectedCardInteractionContext}
    />
  );
};

export default OpponentWrapper;
