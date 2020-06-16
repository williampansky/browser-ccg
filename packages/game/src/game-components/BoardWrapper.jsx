import React from 'react';
import PropTypes from 'prop-types';

import { Board } from '@ccg/components';

const BoardWrapper = props => {
  const {
    G: {
      boards,
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
    theirID,
    yourID
  } = props;

  const { current: currentAP, total: totalAP } = actionPoints[yourID];
  const { hand } = players[yourID];
  const { deckLength, handLength } = counts[yourID];

  return (
    <Board
      theirID={theirID}
      yourID={yourID}
      theirBoard={boards[theirID]}
      yourBoard={boards[yourID]}
      cardIsSelected={selectedCardObject[yourID] ? true : false}
      // handleDropAreaClick={handleDropAreaClick}
    />
  );
};

export default BoardWrapper;
