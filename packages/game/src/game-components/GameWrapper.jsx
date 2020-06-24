import React from 'react';
import PropTypes from 'prop-types';

import {
  ABILITIES_ICON,
  ABILITIES_ICON_CLOSE,
  COST_GEM_IMAGE,
  PLACEHOLDER_IMAGE,
  MECHANICS,
  CARDS,
  SETS
} from '@ccg/images';

import BoardWrapper from './BoardWrapper';
import OpponentWrapper from './OpponentWrapper';
import PlayerWrapper from './PlayerWrapper';
import SelectedCardMobileModalWrapper from './SelectedCardMobileModalWrapper';

const GameWrapper = props => {
  // boardgame props
  const {
    G,
    ctx,
    moves,
    events,
    reset,
    undo,
    redo,
    step,
    log,
    gameID,
    playerID,
    gameMetadata,
    isActive,
    isMultiplayer,
    isConnected,
    credentials
  } = props;

  // id declarations
  const theirID = playerID === '0' ? '1' : '0';
  const yourID = playerID === '0' ? '0' : '1';

  return (
    <div>
      <OpponentWrapper
        G={G}
        ctx={ctx}
        moves={moves}
        playerID={theirID}
        parentComponent={'Opponent'}
        images={{
          CARDS: CARDS,
          SETS: SETS,
          ABILITIES_ICON: ABILITIES_ICON,
          ABILITIES_ICON_CLOSE: ABILITIES_ICON_CLOSE,
          COST_GEM_IMAGE: COST_GEM_IMAGE,
          PLACEHOLDER_IMAGE: PLACEHOLDER_IMAGE
        }}
      />

      <BoardWrapper
        G={G}
        ctx={ctx}
        moves={moves}
        theirID={theirID}
        yourID={yourID}
        images={{
          MECHANICS: MECHANICS
        }}
      />

      <PlayerWrapper
        G={G}
        ctx={ctx}
        moves={moves}
        playerID={yourID}
        parentComponent={'Player'}
        images={{
          CARDS: CARDS,
          SETS: SETS,
          ABILITIES_ICON: ABILITIES_ICON,
          ABILITIES_ICON_CLOSE: ABILITIES_ICON_CLOSE,
          COST_GEM_IMAGE: COST_GEM_IMAGE,
          PLACEHOLDER_IMAGE: PLACEHOLDER_IMAGE
        }}
      />

      <SelectedCardMobileModalWrapper
        G={G}
        ctx={ctx}
        moves={moves}
        playerID={yourID}
        images={{
          CARDS: CARDS,
          SETS: SETS
        }}
      />
    </div>
  );
};

export default GameWrapper;
