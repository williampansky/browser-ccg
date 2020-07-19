import React from 'react';
import PropTypes from 'prop-types';

import { Player } from '@ccg/components';

const PlayerWrapper = props => {
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
      selectedCardIndex,
      selectedCardInteractionContext,
      counts
    },
    ctx,
    moves,
    playerID,
    parentComponent,
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
  const { deck: deckLength, hand: handLength } = counts[playerID];
  const {
    deselectCard,
    selectCard,
    selectCardContext,
    hoverCard,
    initTargetedCard
  } = moves;

  return (
    <Player
      abilitiesImageBase={ABILITIES_ICON}
      abilitiesImageClose={ABILITIES_ICON_CLOSE}
      avatarPlaceholderImageSrc={PLACEHOLDER_IMAGE}
      cardsInDeckCount={deckLength}
      cardsInHandArray={hand}
      cardsInHandCount={handLength}
      costGemImageSrc={COST_GEM_IMAGE}
      deselectCardFunction={() => deselectCard(null)}
      actionPointsCurrent={currentAP}
      actionPointsTotal={totalAP}
      heroAbilities={playerHeroAbilities[playerID]}
      heroSymbol={playerHero[playerID]}
      imagesDataCards={IMAGES_CARDS}
      imagesDataSets={IMAGES_SETS}
      parentComponent={parentComponent}
      playerDeck={deckInfo[playerID]}
      playerHealthCurrent={playerHealth[playerID]}
      playerHealthTotal={30}
      playerName={playerName[playerID]}
      selectCardFunction={(obj, idx) => selectCard(obj, idx)}
      handleCardHoverFunction={idx => hoverCard(idx)}
      handleInitTargetedCardFunction={(obj, idx) => initTargetedCard(obj, idx)}
      selectCardContextFunction={str => selectCardContext(str)}
      selectedCardObject={selectedCardObject[playerID]}
      selectedCardIndex={selectedCardIndex[playerID]}
      selectedCardUuid={
        selectedCardObject[playerID] && selectedCardObject[playerID].uuid
      }
      yourId={playerID}
      selectedCardInteractionContext={selectedCardInteractionContext[playerID]}
    />
  );
};

export default PlayerWrapper;
