/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import { TARGET_CONTEXT } from '@ccg/enums';

export default function CanBeBuffed({ G, ctx, moves, index }) {
  const { selectedCardObject, warcryObject } = G;
  const { currentPlayer } = ctx;
  const { castTargetedSpell, castTargetedWarcry } = moves;

  function handleClick() {
    if (selectedCardObject[currentPlayer] !== null) {
      return castTargetedSpell(TARGET_CONTEXT['SELF'], index);
    } else if (warcryObject[currentPlayer] !== null)
      return castTargetedWarcry(TARGET_CONTEXT['SELF'], index);
  }

  return (
    <div
      className="can-be-buffed"
      data-file="interactions/minions/CanBeBuffed"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
    />
  );
}

CanBeBuffed.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  index: PropTypes.number
};
