import React from 'react';
import PropTypes from 'prop-types';

import {
  Board,
  Opponent,
  Player,
  SelectedCardMobileModal
} from '@ccg/components';

import {
  ABILITIES_ICON,
  ABILITIES_ICON_CLOSE,
  COST_GEM_IMAGE,
  PLACEHOLDER_IMAGE,
  CARDS,
  SETS
} from '@ccg/images';

import PlayerWrapper from './PlayerWrapper';

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

  return (
    <div>
      <PlayerWrapper
        G={G}
        ctx={ctx}
        playerID={playerID}
        images={{
          CARDS: CARDS,
          SETS: SETS,
          ABILITIES_ICON: ABILITIES_ICON,
          ABILITIES_ICON_CLOSE: ABILITIES_ICON_CLOSE,
          COST_GEM_IMAGE: COST_GEM_IMAGE,
          PLACEHOLDER_IMAGE: PLACEHOLDER_IMAGE
        }}
      />
    </div>
  );
};

export default GameWrapper;
