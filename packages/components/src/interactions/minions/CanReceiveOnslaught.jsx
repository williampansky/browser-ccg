/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import { TARGET_CONTEXT } from '@ccg/enums';

export default function CanReceiveOnslaught({ G, ctx, moves, index }) {
  const { castTargetedSpell, castTargetedWarcry } = moves;

  function handleClick() {
    return G.warcryObject[ctx.currentPlayer] !== null
      ? castTargetedWarcry(TARGET_CONTEXT['SELF'], index)
      : castTargetedSpell(TARGET_CONTEXT['SELF'], index);
  }

  return (
    <div
      className="can-be-buffed"
      data-file="interactions/minions/CanReceiveOnslaught"
      onClick={() => handleClick()}
      role="button"
      tabIndex={0}
    />
  );
}

CanReceiveOnslaught.propTypes = {
  G: PropTypes.object,
  ctx: PropTypes.object,
  moves: PropTypes.object,
  index: PropTypes.number
};
