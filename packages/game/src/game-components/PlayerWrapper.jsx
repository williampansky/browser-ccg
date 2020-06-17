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
  const { deck: deckLength, hand: handLength } = counts[playerID];

  const TEMP_CARD = {
    active: true,
    artist:
      '<a href="https://graphicriver.net/user/rexard" rel="noopener noreferrer" target="_blank">Rexard</a>',
    attack: 1,
    cardClass: '%CLASS_NONE%',
    collectible: true,
    cost: 1,
    elite: false,
    entourage: [],
    health: 2,
    howToEarn: 'Provided to all players.',
    mechanics: ['%BULWARK%'],
    id: 'CORE_002',
    name: 'Rookie Lancer',
    race: '%RACE_NONE%',
    rarity: '%RARITY_FREE%',
    set: '%SET_002%',
    text: '<strong>%BULWARK%</strong>',
    type: '%TYPE_MINION%',
    key: 'CORE_002',
    value: 'Rookie Lancer',
    uuid: 'ba11dd5f-0c50-4851-a776-36ead9020712'
  };

  return (
    <Player
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
      yourId={playerID}
      selectedCardContext={selectedCardInteractionContext}
    />
  );
};

export default PlayerWrapper;
