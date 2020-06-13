/* eslint-disable no-unused-vars */
import React, { useState, useLayoutEffect } from 'react';
import Fullscreen from 'react-full-screen';
import { Player, SelectedCardMobileModal } from '@ccg/components';
import { ABILITIES, CARDS_DATABASE } from '@ccg/data';
import { CARDS, SETS } from '@ccg/images';
import { getCardByID, exists } from '@ccg/utils';
import {
  ABILITIES_ICON,
  ABILITIES_ICON_CLOSE,
  COST_GEM_IMAGE,
  PLACEHOLDER_IMAGE
} from '@ccg/images';

const CARD_01 = getCardByID('CORE_001');
const CARD_02 = getCardByID('CORE_002');
const CARD_03 = getCardByID('CORE_003');
const CARD_04 = getCardByID('CORE_004');
const CARD_05 = getCardByID('CORE_005');
const CARD_06 = getCardByID('CORE_006');
const CARD_07 = getCardByID('CORE_007');
const CARD_08 = getCardByID('CORE_008');
const CARD_09 = getCardByID('CORE_009');
const CARD_10 = getCardByID('CORE_010');
const CARDS_ARRAY = [
  CARD_01,
  CARD_02,
  CARD_03,
  CARD_04,
  CARD_05,
  CARD_06
  // CARD_07,
  // CARD_08,
  // CARD_09,
  // CARD_10
];

const HERO = 'EXILE';
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

export default function PlayerDev() {
  const [selectedCardObject, setSelectedCardObject] = useState(TEMP_CARD);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // useLayoutEffect(() => {
  //   document.querySelector('.fullscreen__toggle').click();
  // }, []);

  const CTX_ACTIONS = [
    { label: 'Cancel' },
    { label: 'Attack' },
    { label: 'Buff' }
  ];

  return (
    <Fullscreen
      enabled={isFullScreen}
      onChange={isFull => setIsFullScreen(isFull)}
    >
      <button
        className="addressBarSize"
        onClick={() => setIsFullScreen(!isFullScreen ? true : false)}
      >
        full
      </button>
      <div id="app" style={{ justifyContent: 'flex-end' }}>
        <Player
          abilitiesImageBase={ABILITIES_ICON}
          abilitiesImageClose={ABILITIES_ICON_CLOSE}
          avatarPlaceholderImageSrc={PLACEHOLDER_IMAGE}
          cardsInHandArray={CARDS_ARRAY}
          cardsInDeckCount={PLAYER_DECK.length}
          cardsInHandCount={CARDS_ARRAY.length}
          costGemImageSrc={COST_GEM_IMAGE}
          deselectCardFunction={() => setSelectedCardObject(null)}
          heroAbilities={HERO_ABILITIES}
          heroSymbol={HERO_SYMBOL}
          imagesDataCards={CARDS}
          imagesDataSets={SETS}
          playerDeck={PLAYER_DECK}
          playerId={'0'}
          playerName="pantsme"
          selectCardFunction={obj => setSelectedCardObject(obj)}
          selectedCardObject={selectedCardObject}
          selectedCardUuid={selectedCardObject && selectedCardObject.uuid}
        />
        <SelectedCardMobileModal
          card={selectedCardObject}
          contextActions={CTX_ACTIONS}
          imagesDataCards={CARDS}
          imagesDataSets={SETS}
        />
      </div>
    </Fullscreen>
  );
}
