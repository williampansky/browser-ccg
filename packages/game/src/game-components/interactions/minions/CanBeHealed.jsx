/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { PLAYER_BOARDS, TARGET_CONTEXT } from '@ccg/enums';

export default function CanBeHealed({ G, ctx, moves, board, index }) {
  const { warcryObject } = G;
  const { currentPlayer } = ctx;
  const { castTargetedSpell, castTargetedWarcry } = moves;

  function handleClick() {
    if (warcryObject[currentPlayer] !== null)
      return castTargetedWarcry(
        board === PLAYER_BOARDS[1]
          ? TARGET_CONTEXT['SELF']
          : TARGET_CONTEXT['OPPONENT'],
        index
      );
    else
      return castTargetedSpell(
        board === PLAYER_BOARDS[1]
          ? TARGET_CONTEXT['SELF']
          : TARGET_CONTEXT['OPPONENT'],
        index
      );
  }

  return (
    <div
      className="minion--can-be-buffed"
      data-file="interactions/minions/CanBeHealed"
      onClick={() => handleClick()}
    />
  );
}

CanBeHealed.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  board: PropTypes.string,
  index: PropTypes.number
};
