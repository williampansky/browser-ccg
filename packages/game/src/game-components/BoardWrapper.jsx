import React from 'react';
import PropTypes from 'prop-types';

import { Board } from '@ccg/components';

const BoardWrapper = props => {
  const {
    G,
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
    ctx,
    moves,
    theirID,
    yourID,
    images: { MECHANICS: mechanicImages }
  } = props;

  const { current: currentAP, total: totalAP } = actionPoints[yourID];
  const { hand } = players[yourID];
  const { deckLength, handLength } = counts[yourID];

  return (
    <Board
      G={G}
      ctx={ctx}
      moves={moves}
      theirID={theirID}
      yourID={yourID}
      theirBoard={boards[theirID]}
      yourBoard={boards[yourID]}
      cardIsSelected={selectedCardObject[yourID] ? true : false}
      cardIsLocked={selectedCardInteractionContext[yourID] ? true : false}
      mechanicImages={mechanicImages}
      // handleDropAreaClick={handleDropAreaClick}
    />
  );
};

export default BoardWrapper;
