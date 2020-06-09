/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import { TARGET_CONTEXT } from '@ccg/enums';

export default function CanBeAttackedByWarcry({ moves, index }) {
  const { castTargetedWarcry } = moves;
  return (
    <div
      className="board__slot--can-be-attacked"
      data-file="interactions/minions/CanBeAttackedByWarcry"
      onClick={() => castTargetedWarcry(TARGET_CONTEXT['OPPONENT'], index)}
      role="button"
      tabIndex={0}
    />
  );
}

CanBeAttackedByWarcry.propTypes = {
  moves: PropTypes.object,
  index: PropTypes.number
};
