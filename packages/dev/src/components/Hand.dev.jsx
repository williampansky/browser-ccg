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
  const CARDS_ARRAY = [CARD_01];
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
