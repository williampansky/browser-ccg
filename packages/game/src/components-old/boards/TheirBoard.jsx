import React from 'react';
import PropTypes from 'prop-types';

// configs
import { PLAYER_BOARDS } from '@ccg/enums';

// child components
import Deck from 'components/decks/Deck';
import TheirBoardPlayerArea from 'components/board-play-areas/TheirBoardPlayArea';
import TheirPlayerArea from 'components/player-areas/TheirPlayerArea';

export default function TheirBoard({
  G,
  ctx,
  moves,
  isActive,
  theirID,
  yourID
}) {
  const { counts, playerClass, cardBack } = G;
  const theirDeckLength = counts[theirID].deck;
  const theirCardBackImageSrc = cardBack[theirID];

  return (
    <div data-file="boards/TheirBoard" className={'their-board'}>
      <TheirPlayerArea
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        board={PLAYER_BOARDS[2]}
        theirID={theirID}
        yourID={yourID}
        playerClass={playerClass}
      />

      <TheirBoardPlayerArea
        G={G}
        ctx={ctx}
        moves={moves}
        isActive={isActive}
        board={PLAYER_BOARDS[2]}
        theirID={theirID}
        yourID={yourID}
      />

      <Deck
        board={PLAYER_BOARDS[2]}
        cardBackSrc={theirCardBackImageSrc}
        length={theirDeckLength}
      />
    </div>
  );
}

TheirBoard.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  isActive: PropTypes.bool,
  theirID: PropTypes.string,
  yourID: PropTypes.string
};
