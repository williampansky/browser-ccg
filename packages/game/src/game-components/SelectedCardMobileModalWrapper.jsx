import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useResponsive } from '@ccg/hooks';
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

  const { isDesktop } = useResponsive();
  const { deselectCard, selectCardContext } = moves;
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

  const selectCardContextFunction = useCallback(
    selectedCardContextString => {
      return selectCardContext(selectedCardContextString);
    },
    [selectCardContext]
  );

  return !isDesktop ? (
    <SelectedCardMobileModal
      card={selectedCardObject[playerID]}
      contextActions={handleContextActions(selectedCardObject[playerID])}
      deselectCardFunction={() => deselectCard(null)}
      imagesDataCards={IMAGES_CARDS}
      imagesDataSets={IMAGES_SETS}
      selectCardContextFunction={str => selectCardContextFunction(str)}
      selectedCardInteractionContext={selectedCardInteractionContext[playerID]}
      selectedCardUuid={
        selectedCardObject[playerID] && selectedCardObject[playerID].uuid
      }
    />
  ) : null;
};

export default SelectedCardMobileModalWrapper;
