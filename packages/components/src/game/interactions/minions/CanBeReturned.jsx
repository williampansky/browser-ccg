/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import { TARGET_CONTEXT } from '@ccg/enums';

export default function CanBeReturned({ moves, index, targetContext }) {
  const { castTargetedSpell } = moves;
  return (
    <div
      className="minion--can-be-debuffed"
      data-file="interactions/minions/CanBeReturned"
      onClick={() => castTargetedSpell(TARGET_CONTEXT[targetContext], index)}
      role="button"
      tabIndex={0}
    />
  );
}

CanBeReturned.propTypes = {
  moves: PropTypes.object,
  index: PropTypes.number,
  targetContext: PropTypes.number
};
