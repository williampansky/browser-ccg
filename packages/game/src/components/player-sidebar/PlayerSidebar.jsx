import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import EndTurnButton from '../end-turn/EndTurn';
import Deck from '../decks/DeckV3';
import { PLAYER_BOARDS } from '@ccg/enums';
import MatchStats from './MatchStats';

export default function PlayerSidebar({
  G,
  ctx,
  moves,
  events,
  isActive,
  yourID,
  theirID,
  gameWidth,
  gameHeight
}) {
  const { cardBack, counts, deckInfo, playedCards } = G;

  return (
    <Component
      data-file="player-sidebar/PlayerSidebar"
      gameWidth={gameWidth}
      gameHeight={gameHeight}
    >
      <MatchStats G={G} theirID={theirID} yourID={yourID} />

      <EndTurnButton
        G={G}
        ctx={ctx}
        moves={moves}
        events={events}
        isActive={isActive}
        yourID={yourID}
        theirID={theirID}
      />

      <Deck
        board={PLAYER_BOARDS[1]}
        cardBackSrc={cardBack[yourID]}
        data={deckInfo[yourID]}
        length={counts[yourID].deck}
        playedCards={playedCards[yourID]}
      />
    </Component>
  );
}

// MatchHistory.propTypes = {
//   onClick: PropTypes.func
// };

const Component = styled.div`
  /* display: none; */
  height: ${p =>
    `calc(${p.gameHeight - 40}px - var(--board-theirHand-height))`};
  pointer-events: auto;
  position: absolute;
  top: 0;
  right: 0;
  /* width: ${p => `calc(${p.gameWidth}px / 5.5)`}; */
  width: 300px;
  box-sizing: border-box;
  color: white;
  font-size: 12px;
  overflow: hidden;
  font-family: 'Verdana', sans-serif;
  /* margin: 0 0 0 auto; */
  margin: var(--board-theirHand-height) 0 0;
  z-index: 300;

  &:before {
    background: linear-gradient(rgba(0, 0, 0, 0.85), transparent);
    bottom: auto;
    /* content: ''; */
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 4.25%;
    pointer-events: none;
    z-index: 2;
  }
`;
