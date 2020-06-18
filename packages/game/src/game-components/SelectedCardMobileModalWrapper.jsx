import React from 'react';
import PropTypes from 'prop-types';

import { TYPE } from '@ccg/enums';
import { SelectedCardMobileModal } from '@ccg/components';

const SelectedCardMobileModalWrapper = props => {
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
    ctx,
    moves,
    playerID,
    images: { CARDS: IMAGES_CARDS, SETS: IMAGES_SETS }
  } = props;

  const { deselectCard } = moves;
  const { current: currentAP, total: totalAP } = actionPoints[playerID];
  const { hand } = players[playerID];
  const { deckLength, handLength } = counts[playerID];

  const handleContextActions = cardObject => {
    try {
      const { type } = cardObject;
      switch (type) {
        case TYPE['ITEM']:
          return Array({
            label: 'Use',
            value: '%ITEM%'
          });

        case TYPE['MINION']:
          return Array({
            label: 'Play',
            value: '%SUMMON%'
          });

        case TYPE['SPELL']:
          return Array({
            label: 'Cast',
            value: '%SPELL%'
          });

        case TYPE['WEAPON']:
          return Array({
            label: 'Equip',
            value: '%WEAPON%'
          });

        default:
          return;
      }
    } catch (error) {
      return;
    }
  };

  return (
    <SelectedCardMobileModal
      card={selectedCardObject[playerID]}
      contextActions={handleContextActions(selectedCardObject[playerID])}
      deselectCardFunction={() => deselectCard(null)}
      imagesDataCards={IMAGES_CARDS}
      imagesDataSets={IMAGES_SETS}
      // selectCardContextFunction={str => setSelectedCardContext(str)}
      // selectedCardContext={selectedCardContext}
      selectedCardUuid={
        selectedCardObject[playerID] && selectedCardObject[playerID].uuid
      }
    />
  );
};

export default SelectedCardMobileModalWrapper;
