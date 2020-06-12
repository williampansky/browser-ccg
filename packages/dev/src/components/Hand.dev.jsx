/* eslint-disable no-unused-vars */
import React from 'react';
import { Hand } from '@ccg/components';
import { ABILITIES, CARDS_DATABASE } from '@ccg/data';
import { CARDS, SETS } from '@ccg/images';
import { getCardByID } from '@ccg/utils';
import {
  ABILITIES_ICON,
  ABILITIES_ICON_CLOSE,
  COST_GEM_IMAGE,
  PLACEHOLDER_IMAGE
} from '@ccg/images';

export default function HandDev() {
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
    CARD_06,
    CARD_07,
    CARD_08,
    CARD_09,
    CARD_10
  ];

  return (
    <div id="app" style={{ justifyContent: 'flex-end' }}>
      <Hand
        cardsInHand={CARDS_ARRAY}
        imagesDataCards={CARDS}
        imagesDataSets={SETS}
      />
    </div>
  );
}
